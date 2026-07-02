import { DockerClientService } from "../docker/dockerClientService.js"
import type { ImageInspectResponse } from "../docker/types.js"
import { parseImageRef } from "../docker/parseImageRef.js"
import type { LocalImageInspect, ManifestList, UpdateCheckResult } from "./types.js"
import { ManifestService } from "./manifestService.js"

export class UpdateCheckerService {
  constructor(
    private docker: DockerClientService,
    private manifestService: ManifestService,
  ) {}

  // -----------------------------------------------------
  // Local manifest (unchanged)
  // -----------------------------------------------------
  async local(image: string) {
    const inspect = await this.docker.inspectImage(image)

    return {
      source: "local",
      manifest: {
        Architecture: inspect.Architecture,
        Os: inspect.Os,
        Variant: (inspect as any).Variant ?? null,
        RepoDigests: inspect.RepoDigests ?? [],
      } satisfies LocalImageInspect,
    }
  }

  // -----------------------------------------------------
  // Platform matching helpers (unchanged)
  // -----------------------------------------------------
  private normalizeArch(arch: string): string {
    switch (arch) {
      case "x86_64":
      case "amd64":
        return "amd64"
      case "aarch64":
      case "arm64":
        return "arm64"
      case "armv7":
      case "armhf":
        return "arm"
      default:
        return arch
    }
  }

  private normalizeVariant(variant?: string | null): string | null {
    if (!variant) return null
    return variant.toLowerCase()
  }

  private matchPlatform(manifest: ManifestList, local: LocalImageInspect) {
    const localArch = this.normalizeArch(local.Architecture)
    const localOs = local.Os.toLowerCase()
    const localVariant = this.normalizeVariant(local.Variant)

    let best: { score: number; m: (typeof manifest.manifests)[number] } | null = null

    for (const m of manifest.manifests) {
      if (!m.platform) continue

      const remoteArch = this.normalizeArch(m.platform.architecture)
      const remoteOs = m.platform.os.toLowerCase()
      const remoteVariant = this.normalizeVariant(m.platform.variant)

      if (remoteOs !== localOs) continue
      if (remoteArch !== localArch) continue

      let score = 0

      if (remoteVariant && localVariant && remoteVariant === localVariant) score += 3
      if (remoteVariant && remoteVariant.startsWith("v")) score += 2
      if (!remoteVariant) score += 1

      if (!best || score > best.score) best = { score, m }
    }

    return best?.m ?? null
  }

  // -----------------------------------------------------
  // Docker-correct update checker
  // -----------------------------------------------------
  async checkForUpdate(image: string): Promise<UpdateCheckResult> {
    const ref = parseImageRef(image)

    // Fetch remote manifest (OCI)
    const remote = await this.manifestService.getRemoteManifestFromImage(image)

    // Local inspect
    const localInspect: ImageInspectResponse = await this.docker.inspectImage(ref.repository)

    const local: LocalImageInspect = {
      Architecture: localInspect.Architecture,
      Os: localInspect.Os,
      Variant: (localInspect as any).Variant ?? null,
      RepoDigests: localInspect.RepoDigests ?? [],
    }

    // -----------------------------------------------------
    // LOCAL manifest-list digest (Docker uses this)
    // -----------------------------------------------------
    const localManifestListDigest = localInspect.RepoDigests?.[0]?.split("@")[1] ?? null

    // -----------------------------------------------------
    // CASE 1: MULTI-ARCH IMAGE (manifest list)
    // -----------------------------------------------------
    if (remote.isManifestList && remote.manifestList) {
      const manifest = remote.manifestList

      // Remote manifest-list digest (from registry headers)
      const remoteManifestListDigest = remote.manifestListDigest ?? null

      const updateAvailable =
        localManifestListDigest === null ||
        remoteManifestListDigest === null ||
        localManifestListDigest !== remoteManifestListDigest

      const descriptor = this.matchPlatform(manifest, local)

      const result: UpdateCheckResult = {
        updateAvailable,
        localDigest: localManifestListDigest,
        remoteDigest: remoteManifestListDigest,
        platform: {
          architecture: local.Architecture,
          os: local.Os,
          variant: local.Variant ?? null,
        },
      }

      if (descriptor) {
        result.matchedDescriptor = {
          digest: descriptor.digest,
          mediaType: descriptor.mediaType,
        }
      }

      return result
    }

    // -----------------------------------------------------
    // CASE 2: SINGLE-ARCH IMAGE
    // -----------------------------------------------------
    if (remote.isImageManifest && remote.imageManifest) {
      const remoteDigest = remote.configDigest ?? null

      const updateAvailable =
        localManifestListDigest === null ||
        remoteDigest === null ||
        localManifestListDigest !== remoteDigest

      const result: UpdateCheckResult = {
        updateAvailable,
        localDigest: localManifestListDigest,
        remoteDigest,
        platform: {
          architecture: local.Architecture,
          os: local.Os,
          variant: local.Variant ?? null,
        },
      }

      if (remoteDigest) {
        result.matchedDescriptor = {
          digest: remoteDigest,
          mediaType: remote.mediaType,
        }
      }

      return result
    }

    throw new Error("Unsupported manifest type: neither list nor image manifest")
  }
}
