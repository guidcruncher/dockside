import { BaseClient } from "./dockside-sdk"

export interface DockerImageSummary {
  Id: string
  RepoTags?: string[]
  RepoDigests?: string[]
  Created: number
  Size: number
  VirtualSize: number
}

export interface DockerImageInspect {
  Id: string
  RepoTags?: string[]
  Created: string
  Author?: string
  Config: any
}

export class ImagesClient extends BaseClient {
  constructor(baseUrl: string, fetchImpl: typeof fetch) {
    super(baseUrl, fetchImpl)
  }

  list(): Promise<DockerImageSummary[]> {
    return this.request("/api/v1/docker/images/")
  }

  inspect(name: string): Promise<DockerImageInspect> {
    return this.request(`/api/v1/docker/images/${encodeURIComponent(name)}`)
  }

  remove(name: string, params?: { force?: boolean }): Promise<void> {
    return this.request(
      `/api/v1/docker/images/${encodeURIComponent(name)}${this.buildQuery(params)}`,
      {
        method: "DELETE",
      },
    )
  }
}
