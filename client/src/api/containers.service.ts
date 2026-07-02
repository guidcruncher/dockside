import { BaseClient } from "./dockside-sdk"

export interface DockerPortBinding {
  IP?: string
  PrivatePort: number
  PublicPort?: number
  Type: string
}

export interface DockerContainerSummary {
  Id: string
  Names: string[]
  Image: string
  State: string
  Status: string
  Ports: DockerPortBinding[]
}

export interface DockerContainerInspect {
  Id: string
  Name: string
  Image: string
  Config: any
  State: any
  NetworkSettings: any
}

export class ContainersClient extends BaseClient {
  constructor(baseUrl: string, fetchImpl: typeof fetch) {
    super(baseUrl, fetchImpl)
  }

  list(params?: { all?: boolean; limit?: number }): Promise<DockerContainerSummary[]> {
    return this.request(`/api/v1/docker/containers/${this.buildQuery(params)}`)
  }

  inspect(id: string): Promise<DockerContainerInspect> {
    return this.request(`/api/v1/docker/containers/${encodeURIComponent(id)}`)
  }

  remove(id: string, params?: { force?: boolean; v?: boolean }): Promise<void> {
    return this.request(
      `/api/v1/docker/containers/${encodeURIComponent(id)}${this.buildQuery(params)}`,
      { method: "DELETE" },
    )
  }

  start(id: string): Promise<void> {
    return this.request(`/api/v1/docker/containers/${encodeURIComponent(id)}/start`, {
      method: "POST",
    })
  }

  stop(id: string, params?: { t?: number }): Promise<void> {
    return this.request(
      `/api/v1/docker/containers/${encodeURIComponent(id)}/stop${this.buildQuery(params)}`,
      { method: "POST" },
    )
  }

  restart(id: string, params?: { t?: number }): Promise<void> {
    return this.request(
      `/api/v1/docker/containers/${encodeURIComponent(id)}/restart${this.buildQuery(params)}`,
      { method: "POST" },
    )
  }

  logs(
    id: string,
    params?: { stdout?: boolean; stderr?: boolean; follow?: boolean },
  ): Promise<string> {
    return this.request(
      `/api/v1/docker/containers/${encodeURIComponent(id)}/logs${this.buildQuery(params)}`,
    )
  }
}
