// src/services/registry/registryClientService.ts
import type {
  RemoteManifestResult,
  ImageManifest,
  RegistryAuthToken,
  ManifestList,
} from "./types.js"
import { createRemoteManifestResult } from "./createRemoteManifestResult.js"

export class RegistryClientService {
  constructor() {}

  // -----------------------------------------------------
  // Internal fetch wrapper
  // -----------------------------------------------------
  private async request<T>(url: string, init: RequestInit): Promise<T> {
    const res = await fetch(url, init)

    if (!res.ok) {
      const body = await res.text().catch(() => "")
      throw new Error(`Registry request failed: ${res.status} ${res.statusText}\n${body}`)
    }

    return res.json() as Promise<T>
  }

  // -----------------------------------------------------
  // Token retrieval (fix: normalize relative URLs)
  // -----------------------------------------------------
  async getToken(url: string): Promise<string> {
    if (url.startsWith("/")) {
      url = `https://auth.docker.io${url}`
    }

    const json = await this.request<RegistryAuthToken>(url, {
      method: "GET",
    })

    return json.token
  }

  // -----------------------------------------------------
  // High-level: fetch remote manifest (list or image)
  // -----------------------------------------------------
  async getRemoteManifest(
    registryUrl: string,
    repo: string,
    reference: string,
    token: string,
  ): Promise<RemoteManifestResult> {
    const base = registryUrl || "https://registry-1.docker.io"
    const url = `${base}/v2/${repo}/manifests/${reference}`

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: [
          "application/vnd.docker.distribution.manifest.list.v2+json",
          "application/vnd.oci.image.index.v1+json",
          "application/vnd.docker.distribution.manifest.v2+json",
          "application/vnd.oci.image.manifest.v1+json",
        ].join(", "),
      },
    })

    if (!res.ok) {
      const body = await res.text().catch(() => "")
      throw new Error(`Manifest fetch failed: ${res.status} ${res.statusText}\n${body}`)
    }

    // -----------------------------------------------------
    // Extract manifest digest from registry headers
    // -----------------------------------------------------
    const manifestDigest =
      res.headers.get("docker-content-digest") ?? res.headers.get("Docker-Content-Digest") ?? null

    // -----------------------------------------------------
    // Parse JSON body
    // -----------------------------------------------------
    const rawUnknown: unknown = await res.json()

    if (typeof rawUnknown !== "object" || rawUnknown === null || !("mediaType" in rawUnknown)) {
      throw new Error("Invalid manifest: missing mediaType")
    }

    const raw = rawUnknown as ManifestList | ImageManifest

    // -----------------------------------------------------
    // Build fully populated RemoteManifestResult
    // -----------------------------------------------------
    return createRemoteManifestResult(
      base,
      repo,
      reference,
      raw,
      manifestDigest, // <-- FIXED: required argument
    )
  }

  // -----------------------------------------------------
  // Manifest list (index)
  // -----------------------------------------------------
  async getManifestList(
    registryUrl: string,
    repo: string,
    reference: string,
    token: string,
  ): Promise<ManifestList> {
    const base = registryUrl || "https://registry-1.docker.io"
    const url = `${base}/v2/${repo}/manifests/${reference}`

    return this.request<ManifestList>(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: [
          "application/vnd.docker.distribution.manifest.list.v2+json",
          "application/vnd.oci.image.index.v1+json",
        ].join(", "),
      },
    })
  }

  // -----------------------------------------------------
  // Single image manifest
  // -----------------------------------------------------
  async getImageManifest(
    registryUrl: string,
    repo: string,
    digest: string,
    token: string,
  ): Promise<ImageManifest> {
    const base = registryUrl || "https://registry-1.docker.io"
    const url = `${base}/v2/${repo}/manifests/${digest}`

    return this.request<ImageManifest>(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: [
          "application/vnd.docker.distribution.manifest.v2+json",
          "application/vnd.oci.image.manifest.v1+json",
        ].join(", "),
      },
    })
  }
}
