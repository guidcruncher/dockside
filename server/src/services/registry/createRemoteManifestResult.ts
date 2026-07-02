import type { RemoteManifestResult, ImageManifest, ManifestList } from "./types.js"

/**
 * Factory helper to populate a RemoteManifestResult from raw registry JSON.
 *
 * NOTE: `manifestDigest` MUST come from the registry response header:
 *   Docker-Content-Digest: sha256:xxxx
 */
export function createRemoteManifestResult(
  registry: string,
  repository: string,
  reference: string,
  raw: ImageManifest | ManifestList,
  manifestDigest: string | null, // <-- REQUIRED
): RemoteManifestResult {
  const mediaType = raw.mediaType ?? ""

  const isManifestList =
    mediaType === "application/vnd.docker.distribution.manifest.list.v2+json" ||
    mediaType === "application/vnd.oci.image.index.v1+json"

  const isImageManifest =
    mediaType === "application/vnd.docker.distribution.manifest.v2+json" ||
    mediaType === "application/vnd.oci.image.manifest.v1+json"

  const manifestList = isManifestList ? (raw as ManifestList) : null
  const imageManifest = isImageManifest ? (raw as ImageManifest) : null

  const configDigest = imageManifest?.config?.digest ?? null
  const layerDigests = imageManifest?.layers?.map((l) => l.digest) ?? []

  return {
    registry,
    repository,
    reference,

    raw,
    mediaType,

    isManifestList,
    isImageManifest,

    manifestList,
    imageManifest,

    configDigest,
    layerDigests,

    // NEW: required for update checking
    manifestListDigest: manifestDigest,

    toString() {
      return `${registry}/${repository}@${reference}`
    },
  }
}
