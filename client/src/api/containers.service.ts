import { BaseClient } from "./dockside-sdk"

export interface DockerContainerStats {
  id: string
  name: string
  osType: string
  read: string

  cpu: {
    percent: number // multi-core CPU %
    percentNormalized: number // single-core normalized %
    cores: number // online CPU count
  }

  memory: {
    percent: number // working-set memory %
    usage: number // raw usage (bytes)
    limit: number // memory limit (bytes)
  }

  network: {
    rx: number // total received bytes
    tx: number // total transmitted bytes
  }

  blkio: {
    read: number // total block read bytes
    write: number // total block write bytes
  }

  pids: number // number of running processes
}

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

  stats(id: string): Promise<DockerContainerStats> {
    return this.request(`/api/v1/docker/containers/${encodeURIComponent(id)}/stats`)
  }

  statsList(ids: string[]): Promise<DockerContainerStats[]> {
    return this.request(`/api/v1/docker/containers/stats?ids=${encodeURIComponent(ids.join(","))}`)
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
