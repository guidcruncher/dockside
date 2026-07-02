import { parseImageRef } from "../docker/parseImageRef.js"
import type { RepositoryMetadata } from "./types.js"
import { getGhcrToken } from "./getGhcrToken.js"
import type { Config } from "../../config/types.js"

export interface RepositoryMetadataResult {
  source: string
  metadata: RepositoryMetadata
}

// -----------------------------------------------------
// Strict-mode safe narrowing helper
// -----------------------------------------------------
function assertObject(value: unknown): asserts value is Record<string, any> {
  if (typeof value !== "object" || value === null) {
    throw new Error("Expected object metadata from registry API")
  }
}

export class MetadataService {
  constructor(private config: Config) {}

  // -----------------------------------------------------
  // Registry normalization (same as ManifestService)
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
  // Docker Hub metadata
  // -----------------------------------------------------
  async dockerHub(repo: string): Promise<RepositoryMetadataResult> {
    const url = `https://hub.docker.com/v2/repositories/${repo}`

    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Docker Hub metadata fetch failed: ${res.status}`)
    }

    const rawUnknown: unknown = await res.json()
    assertObject(rawUnknown)
    const raw = rawUnknown

    return {
      source: "docker.io",
      metadata: {
        name: raw.name ?? repo,
        description: raw.description ?? null,
        lastUpdated: raw.last_updated ?? null,
        pulls: raw.pull_count ?? null,
        stars: raw.star_count ?? null,
        tags: null,
        raw,
      },
    }
  }

  // -----------------------------------------------------
  // GHCR metadata (GitHub API) with authentication
  // -----------------------------------------------------
  async ghcr(repo: string): Promise<RepositoryMetadataResult> {
    const [owner, image] = repo.split("/")

    // Acquire GHCR registry token using username + PAT
    let token: string | null = null
    try {
      token = await getGhcrToken(this.config)
    } catch (err) {
      console.warn("Failed to acquire GHCR token:", (err as Error).message)
    }

    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    // Try user endpoint first
    const userUrl = `https://api.github.com/users/${owner}/packages/container/${image}`
    const orgUrl = `https://api.github.com/orgs/${owner}/packages/container/${image}`

    let res = await fetch(userUrl, { headers })
    if (res.status === 404) {
      res = await fetch(orgUrl, { headers })
    }

    if (!res.ok) {
      throw new Error(`GHCR metadata fetch failed: ${res.status}`)
    }

    const rawUnknown: unknown = await res.json()
    assertObject(rawUnknown)
    const raw = rawUnknown

    return {
      source: "ghcr.io",
      metadata: {
        name: raw.name ?? repo,
        description: raw.description ?? null,
        lastUpdated: raw.updated_at ?? null,
        pulls: raw.download_count ?? null,
        stars: null,
        tags: null, // GHCR package endpoint does NOT include tags
        raw,
      },
    }
  }

  // -----------------------------------------------------
  // LSCR metadata (same as GHCR)
  // -----------------------------------------------------
  async lscr(repo: string): Promise<RepositoryMetadataResult> {
    return this.ghcr(repo)
  }

  // -----------------------------------------------------
  // Quay metadata
  // -----------------------------------------------------
  async quay(repo: string): Promise<RepositoryMetadataResult> {
    const url = `https://quay.io/api/v1/repository/${repo}`

    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Quay metadata fetch failed: ${res.status}`)
    }

    const rawUnknown: unknown = await res.json()
    assertObject(rawUnknown)
    const raw = rawUnknown

    const tags = raw.tags ? Object.keys(raw.tags) : null

    return {
      source: "quay.io",
      metadata: {
        name: raw.name ?? repo,
        description: raw.description ?? null,
        lastUpdated: raw.last_modified ?? null,
        pulls: raw.pull_count ?? null,
        stars: raw.star_count ?? null,
        tags,
        raw,
      },
    }
  }

  // -----------------------------------------------------
  // Unified entry point (like ManifestService.fromImage)
  // -----------------------------------------------------
  async fromImage(image: string): Promise<RepositoryMetadataResult> {
    const ref = parseImageRef(image)

    if (ref.isLocal) {
      throw new Error("Local images do not have remote metadata")
    }

    const registry = this.normalizeRegistry(ref.registry)

    switch (registry) {
      case "docker.io":
        return this.dockerHub(ref.repository)

      case "ghcr.io":
        return this.ghcr(ref.repository)

      case "lscr.io":
        return this.lscr(ref.repository)

      case "quay.io":
        return this.quay(ref.repository)

      default:
        throw new Error(`Unsupported registry for metadata: ${registry}`)
    }
  }
}
