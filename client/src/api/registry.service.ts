import { BaseClient } from "./dockside-sdk"

export interface RegistryManifestResponse {
  schemaVersion?: number
  mediaType?: string
  config?: any
  layers?: any[]
}

export interface RegistryMetadataResponse {
  name?: string
  description?: string
  tags?: string[]
}

export interface RegistryInfoResponse {
  manifest: RegistryManifestResponse
  metadata: RegistryMetadataResponse
}

export type RegistryTagsResponse = string[]

export interface RegistryUpdateResponse {
  currentTag: string
  latestTag: string
  hasUpdate: boolean
  updateAvailable: boolean
  digest: string
}

export class RegistryClient extends BaseClient {
  constructor(baseUrl: string, fetchImpl: typeof fetch) {
    super(baseUrl, fetchImpl)
  }

  manifest(imageRef: string): Promise<RegistryManifestResponse> {
    return this.request(`/api/v1/registry/registry/manifest/${encodeURIComponent(imageRef)}`)
  }

  metadata(imageRef: string): Promise<RegistryMetadataResponse> {
    return this.request(`/api/v1/registry/registry/metadata/${encodeURIComponent(imageRef)}`)
  }

  info(imageRef: string): Promise<RegistryInfoResponse> {
    return this.request(`/api/v1/registry/registry/info/${encodeURIComponent(imageRef)}`)
  }

  tags(imageRef: string): Promise<RegistryTagsResponse> {
    return this.request(`/api/v1/registry/registry/tags/${encodeURIComponent(imageRef)}`)
  }

  update(imageRef: string): Promise<RegistryUpdateResponse> {
    return this.request(`/api/v1/registry/update/${encodeURIComponent(imageRef)}`)
  }
}
