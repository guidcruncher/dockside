// src/services/registry/manifestService.ts
import { DockerClientService } from "../docker/dockerClientService.js"
import { RegistryClientService } from "./registryClientService.js"
import type { ImageInspectResponse } from "../docker/types.js"
import { parseImageRef } from "../docker/parseImageRef.js"
import type { RemoteManifestResult, ManifestList, LocalImageInspect } from "./types.js"
import type { Config } from "../../config/types.js"
import { getGhcrToken } from "./getGhcrToken.js"

export class ManifestService {
  constructor(
    private config: Config,
    private docker: DockerClientService,
    private registry: RegistryClientService,
  ) {}

  // -----------------------------------------------------
  // Registry fetchers
  // -----------------------------------------------------

  async dockerHub(repo: string, reference = "latest") {
    const token = await this.registry.getToken(
      `https://auth.docker.io/token?service=registry.docker.io&scope=repository:${repo}:pull`,
    )

    const manifest = await this.registry.getManifestList(
      "https://registry-1.docker.io",
      repo,
      reference,
      token,
    )

    return { source: "docker.io", manifest }
  }

  async ghcr(repo: string, reference: string) {
    const token = await getGhcrToken(this.config)

    const manifest = await this.registry.getManifestList("https://ghcr.io", repo, reference, token)

    return { source: "ghcr.io", manifest }
  }

  async lscr(repo: string, reference: string) {
    const token = await getGhcrToken(this.config)

    const manifest = await this.registry.getManifestList("https://lscr.io", repo, reference, token)

    return { source: "lscr.io", manifest }
  }

  async quay(repo: string, reference = "latest") {
    const token = await this.registry.getToken(
      `https://quay.io/v2/auth?service=quay.io&scope=repository:${repo}:pull`,
    )

    const manifest = await this.registry.getManifestList("https://quay.io", repo, reference, token)

    return { source: "quay.io", manifest }
  }

  // -----------------------------------------------------
  // Registry normalization
  // -----------------------------------------------------
  private normalizeRegistry(reg: string | null): string {
    const r = (reg ?? "").toLowerCase()

    if (r === "" || r === "docker.io" || r === "registry-1.docker.io" || r === "index.docker.io") {
      return "docker.io"
    }

    if (r === "ghcr.io") return "ghcr.io"
    if (r === "lscr.io") return "lscr.io"
    if (r === "quay.io") return "quay.io"

    return r
  }

  // -----------------------------------------------------
  // High-level: fetch remote manifest from an image ref
  // -----------------------------------------------------
  async getRemoteManifestFromImage(image: string): Promise<RemoteManifestResult> {
    const ref = parseImageRef(image)

    if (ref.isLocal) {
      throw new Error("Local images do not have remote manifests")
    }

    const registry = this.normalizeRegistry(ref.registry)

    let tokenUrl: string
    let registryUrl: string

    switch (registry) {
      case "docker.io":
        tokenUrl = `https://auth.docker.io/token?service=registry.docker.io&scope=repository:${ref.repository}:pull`
        registryUrl = "https://registry-1.docker.io"
        break

      case "ghcr.io":
        tokenUrl = `https://ghcr.io/token?service=ghcr.io&scope=repository:${ref.repository}:pull`
        registryUrl = "https://ghcr.io"
        break

      case "lscr.io":
        tokenUrl = `https://ghcr.io/token?service=ghcr.io&scope=repository:${ref.repository}:pull`
        registryUrl = "https://lscr.io"
        break

      case "quay.io":
        tokenUrl = `https://quay.io/v2/auth?service=quay.io&scope=repository:${ref.repository}:pull`
        registryUrl = "https://quay.io"
        break

      default:
        throw new Error(`Unsupported registry: ${registry}`)
    }

    const token = await this.registry.getToken(tokenUrl)

    return this.registry.getRemoteManifest(registryUrl, ref.repository, ref.reference, token)
  }

  // -----------------------------------------------------
  // Fetch tag list for any registry (OCI API)
  // -----------------------------------------------------
  async getTagList(image: string): Promise<string[]> {
    const ref = parseImageRef(image)

    if (ref.isLocal) {
      throw new Error("Local images do not have remote tags")
    }

    const registry = this.normalizeRegistry(ref.registry)
    const repo = ref.repository

    let registryUrl: string
    let token: string

    switch (registry) {
      case "docker.io":
        registryUrl = "https://registry-1.docker.io"
        token = await this.registry.getToken(
          `https://auth.docker.io/token?service=registry.docker.io&scope=repository:${repo}:pull`,
        )
        break

      case "ghcr.io":
        registryUrl = "https://ghcr.io"
        token = await getGhcrToken(this.config)
        break

      case "lscr.io":
        registryUrl = "https://lscr.io"
        token = await getGhcrToken(this.config)
        break

      case "quay.io":
        registryUrl = "https://quay.io"
        token = await this.registry.getToken(
          `https://quay.io/v2/auth?service=quay.io&scope=repository:${repo}:pull`,
        )
        break

      default:
        throw new Error(`Unsupported registry for tag listing: ${registry}`)
    }

    const url = `${registryUrl}/v2/${repo}/tags/list`

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch tag list: ${res.status} ${res.statusText}`)
    }

    const data: any = await res.json()

    if (!data.tags || !Array.isArray(data.tags)) {
      return []
    }

    return data.tags
  }
}
