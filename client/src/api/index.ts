export type { ProxyConfig } from "./proxy.service"
import { ProxyClient } from "./proxy.service"
export type {
  DockerPortBinding,
  DockerContainerSummary,
  DockerContainerInspect,
  DockerContainerStats,
} from "./containers.service"
import { ContainersClient } from "./containers.service"
import { DependencyClient } from "./dependency.service"

export type { SystemMonitorSnapshot } from "./server.service"
import { ServerClient } from "./server.service"

export type { DocksideClientOptions, ErrorResponse } from "./dockside-sdk"
import type { DocksideClientOptions } from "./dockside-sdk"
export type { DockerImageSummary, DockerImageInspect } from "./images.service"
import { ImagesClient } from "./images.service"

export type {
  DeployProjectResponse,
  ComposeLinkResponse,
  DockerNetwork,
  DockerVolume,
} from "./orchestration.service"
import { OrchestrationClient } from "./orchestration.service"

export type {
  RegistryManifestResponse,
  RegistryMetadataResponse,
  RegistryInfoResponse,
  RegistryTagsResponse,
  RegistryUpdateResponse,
} from "./registry.service"
import { RegistryClient } from "./registry.service"

import { TemplateClient } from "./template.service"
export type { TemplateIndex, TemplateIndexEntry, Template } from "./template.service"

import { PortainerClient } from "./portainer.service"

export type { DockerVersionInfo, DockerSystemInfo, SystemDescriptor } from "./system.service"
import { SystemClient } from "./system.service"

export type {
  WorkspaceStatus,
  WorkspaceProjectState,
  WorkspaceState,
  CreateProjectRequest,
  CreateProjectResponse,
  ToggleFavoriteResponse,
  UpdateProjectStatusRequest,
  UpdateProjectStatusResponse,
} from "./workspace.service"
import { WorkspaceClient } from "./workspace.service"

const getOriginWithOptionalPort = (): string => {
  const { protocol, hostname, port } = window.location

  const isStandard =
    (protocol === "http:" && port === "80") || (protocol === "https:" && port === "443")

  const portPart = port && !isStandard ? `:${port}` : ""

  return `${protocol}//${hostname}${portPart}`
}

export class DocksideClient {
  workspace: WorkspaceClient
  containers: ContainersClient
  images: ImagesClient
  system: SystemClient
  orchestration: OrchestrationClient
  registry: RegistryClient
  template: TemplateClient
  portainer: PortainerClient
  server: ServerClient
  proxy: ProxyClient
  dependency: DependencyClient

  constructor(options: DocksideClientOptions = {}) {
    const baseUrl = options.baseUrl ?? getOriginWithOptionalPort()
    const fetchImpl =
      options.fetchImpl ??
      (typeof window !== "undefined" ? window.fetch.bind(window) : globalThis.fetch)

    this.dependency = new DependencyClient(baseUrl, fetchImpl)
    this.proxy = new ProxyClient(baseUrl, fetchImpl)
    this.server = new ServerClient(baseUrl, fetchImpl)
    this.portainer = new PortainerClient(baseUrl, fetchImpl)
    this.workspace = new WorkspaceClient(baseUrl, fetchImpl)
    this.containers = new ContainersClient(baseUrl, fetchImpl)
    this.images = new ImagesClient(baseUrl, fetchImpl)
    this.system = new SystemClient(baseUrl, fetchImpl)
    this.orchestration = new OrchestrationClient(baseUrl, fetchImpl)
    this.registry = new RegistryClient(baseUrl, fetchImpl)
    this.template = new TemplateClient(baseUrl, fetchImpl)
  }
}

export const docksideClient = new DocksideClient()
