import { BaseClient } from "./dockside-sdk"

export interface DeployProjectResponse {
  success: boolean
  deployedContainers: { serviceName: string; containerId: string }[]
  errors: string[]
}

export interface ComposeLinkResponse {
  dsId: string
  projectName: string
  serviceName: string
  workingDir: string
  configFile: string
}

export interface DockerNetwork {
  Name: string
  Id: string
  Created: string
  Scope: string
  Driver: string
  EnableIPv6: boolean
  IPAM: any
}

export interface DockerVolume {
  Name: string
  Driver: string
  Mountpoint: string
  Labels?: Record<string, string>
  Scope: string
}

export class OrchestrationClient extends BaseClient {
  constructor(baseUrl: string, fetchImpl: typeof fetch) {
    super(baseUrl, fetchImpl)
  }

  deploy(dsId: string): Promise<DeployProjectResponse> {
    return this.request(`/api/v1/deploy/projects/${encodeURIComponent(dsId)}/deploy`, {
      method: "POST",
    })
  }

  getComposeLink(containerId: string): Promise<ComposeLinkResponse> {
    return this.request(
      `/api/v1/docker/orchestration/compose-link?id=${encodeURIComponent(containerId)}`,
    )
  }

  listNetworks(): Promise<DockerNetwork[]> {
    return this.request("/api/v1/docker/orchestration/networks")
  }

  listVolumes(): Promise<DockerVolume[]> {
    return this.request("/api/v1/docker/orchestration/volumes")
  }
}
