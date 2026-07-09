import type { Config } from "#/config/types.js"
import { PersistentWorkspaceStore } from "#/store/workspaceStore.js"
import { existsSync, mkdirSync } from "node:fs"
import fs from "node:fs/promises"
import path from "node:path"
import { StringBuilder } from "#/utils/stringBuilder.js"

export class ProxyService {
  constructor(
    private config: Config,
    private workspace: PersistentWorkspaceStore,
  ) {}

  async getProxyConfig(dsid: string): Promise<string | undefined> {
    const proj = this.workspace.find(dsid)

    if (!proj) return undefined

    const filename = `${proj.folderPath}/caddyfile.json`

    if (!existsSync(filename)) return ""

    return fs.readFile(filename, "utf-8")
  }

  async saveProxyConfig(dsid: string, config: string) {
    const proj = this.workspace.find(dsid)

    if (!proj) return undefined

    const filename = `${proj.folderPath}/caddyfile.json`

    if (existsSync(filename)) {
      await fs.copyFile(filename, `${filename}.bak`)
    }

    return fs.writeFile(filename, config, "utf-8")
  }

  async compileConfig(): Promise<string> {
    const projects = this.workspace.getState().projects
    const sb = new StringBuilder()

    for (const key of Object.keys(projects)) {
      const proj = projects[key]
      if (!proj) continue

      const filename = `${proj.folderPath}/caddyfile.json`
      if (existsSync(filename)) {
        const cfg = await fs.readFile(filename, "utf-8")
        sb.appendLine(`# ${proj.projectName}`)
        sb.appendLine(cfg)
        sb.appendLine("")
      }
    }

    return sb.toString()
  }

  async commitConfig() {
    const baseFolder = this.config.proxy.configFolder
    const rootFile = path.join(this.config.proxy.configFolder, "Caddyfile")

    if (!existsSync(baseFolder)) mkdirSync(baseFolder, { recursive: true })

    if (this.config.proxy.useImports) {
      const projects = this.workspace.getState().projects
      const sb = new StringBuilder()

      for (const key of Object.keys(projects)) {
        const proj = projects[key]
        if (!proj) continue

        const filename = `${proj.folderPath}/caddyfile.json`
        if (existsSync(filename)) {
          const cfg = await fs.readFile(filename, "utf-8")
          await fs.writeFile(path.join(baseFolder, `${proj.projectName}`), cfg, "utf-8")
          sb.appendLine(`# Project:  ${proj.projectName}`)
          sb.appendLine(`# Location: ${proj.folderPath}`)
          sb.appendLine(`import ./${proj.projectName}`)
          sb.appendLine("")
        }
      }

      await fs.writeFile(rootFile, sb.toString(), "utf-8")
    } else {
      const cfg = await this.compileConfig()
      await fs.writeFile(rootFile, cfg, "utf-8")
    }
  }
}
