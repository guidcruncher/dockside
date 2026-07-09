import type { PortainerTemplateEntry, TemplateVolume, TemplateEnvironmentVar } from "./types.js"

import type { ComposeConfig, Service } from "#/services/compose/types.js"

export class ComposeFromPortainerTemplate {
  constructor(
    private template: PortainerTemplateEntry,
    private fileLoader?: {
      loadLogo?: (uri: string) => Promise<string>
      loadEnvPreset?: (name: string) => Promise<string | undefined>
      loadImageMetadata?: (image: string) => Promise<Record<string, any>>
    },
  ) {}

  async build(): Promise<ComposeConfig> {
    const serviceName = this.slug(this.template.title)

    const service: Service = {
      image: this.template.image,
      container_name: serviceName,
      ports: this.template.ports ?? [],
      volumes: this.mapVolumes(this.template.volumes),
      environment: await this.mapEnvironment(this.template.environment),
    }
    if (this.template.restart_policy) {
      service.restart = this.template.restart_policy
    }

    const compose: ComposeConfig = {
      version: "3.9",
      services: {
        [serviceName]: service,
      },
    }

    return compose
  }

  private slug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  private mapVolumes(vols?: TemplateVolume[]): string[] {
    if (!vols) return []
    return vols.map((v) => `${v.bind}:${v.container}`)
  }

  private async mapEnvironment(env?: TemplateEnvironmentVar[]): Promise<string[]> {
    if (!env) return []

    const result: string[] = []

    for (const e of env) {
      let value = ""

      // Load preset value if loader provided
      if (this.fileLoader?.loadEnvPreset) {
        const preset = await this.fileLoader.loadEnvPreset(e.name)
        if (preset) value = preset
      }

      result.push(`${e.name}=${value}`)
    }

    return result
  }
}
