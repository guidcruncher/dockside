import type { Template } from "./types.js"
import { normalizeTemplate } from "./normalizeTemplate.js"

import type { ComposeConfig, Service } from "#/services/compose/types.js"

export class ComposeFromTemplate {
  constructor(private template: Template) {}

  async build(): Promise<ComposeConfig> {
    const compose: ComposeConfig = normalizeTemplate(this.template)
    return compose
  }
}
