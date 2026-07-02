import { BaseClient } from "./dockside-sdk"

import type { ComposeConfig } from "@/types"

export interface TemplateIndexEntry {
  name: string
  version: number
}

export type TemplateIndex = Record<string, TemplateIndexEntry>

export interface Template {
  name: string
  logo: string
  author: string
  license: string
  description: string
  weburl: string
  docsurl: string
  type: "application/x-yaml" | "text/yaml" | "application/json"
  raw: ComposeConfig
}

export class TemplateClient extends BaseClient {
  constructor(baseUrl: string, fetchImpl: typeof fetch) {
    super(baseUrl, fetchImpl)
  }

  getIndex(): Promise<TemplateIndex> {
    return this.request("/api/v1/templates")
  }

  getTemplate(name: string): Promise<Template> {
    return this.request(`/api/v1/templaes/${encodeURIComponent(name)}`)
  }
}
