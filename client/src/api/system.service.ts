import { BaseClient } from "./dockside-sdk"

export interface DockerVersionInfo {
  Version: string
  ApiVersion: string
  Os: string
  Arch: string
  KernelVersion: string
}

export interface DockerSystemInfo {
  Containers: number
  ContainersRunning: number
  ContainersPaused: number
  ContainersStopped: number
  Images: number
  Driver: string
  ServerVersion: string
}

export interface SystemDescriptor {
  platform: string
  os: string
  arch: string
  kernelVersion: string
  serverVersion: string
}

export class SystemClient extends BaseClient {
  constructor(baseUrl: string, fetchImpl: typeof fetch) {
    super(baseUrl, fetchImpl)
  }

  version(): Promise<DockerVersionInfo> {
    return this.request("/api/v1/docker/system/version")
  }

  info(): Promise<DockerSystemInfo> {
    return this.request("/api/v1/docker/system/info")
  }

  descriptor(): Promise<SystemDescriptor> {
    return this.request("/api/v1/docker/system/descriptor")
  }

  prune(): Promise<any> {
    return this.request("/api/v1/docker/system/prune", { method: "POST" })
  }
}
