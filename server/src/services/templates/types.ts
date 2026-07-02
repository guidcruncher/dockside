import type { ComposeConfig } from "#/services/compose/types.js"

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
  raw: ComposeConfig | string
}
