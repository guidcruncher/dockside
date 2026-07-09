import * as fs from "fs/promises"
import * as path from "path"
import type { ComposeConfig } from "./types.js"
import { fromYaml } from "./composeConverter.js"
import logger from "#/logger.js"

export interface DockerProjectMetadata {
  projectName: string
  configPath: string
  folderPath: string
  services: any[]
}

export class DockerFolderScanner {
  public readonly workspaceRoot: string

  constructor(private targetDir: string) {
    this.workspaceRoot = targetDir
  }

  private static readonly COMPOSE_FILENAMES = [
    "docker-compose.yml",
    "docker-compose.yaml",
    "compose.yml",
    "compose.yaml",
  ]

  public async scanDirectory(): Promise<DockerProjectMetadata[]> {
    const discoveredProjects: DockerProjectMetadata[] = []
    await this.recursiveScan(this.targetDir, discoveredProjects)
    return discoveredProjects
  }

  private async recursiveScan(currentDir: string, results: DockerProjectMetadata[]): Promise<void> {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true })

      const composeFile = entries.find(
        (entry) =>
          entry.isFile() &&
          DockerFolderScanner.COMPOSE_FILENAMES.includes(entry.name.toLowerCase()),
      )

      if (composeFile) {
        const fullPath = path.join(currentDir, composeFile.name)
        try {
          const projectMeta = await this.extractMetadata(fullPath, currentDir)
          results.push(projectMeta)
          return
        } catch (err) {
          logger.error(err, `Skipping invalid compose file at ${fullPath}:`)
        }
      }

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const nextTarget = path.join(currentDir, entry.name)
          if (entry.name === "node_modules" || entry.name === ".git") {
            continue
          }
          await this.recursiveScan(nextTarget, results)
        }
      }
    } catch (error) {
      logger.error(error, `Error reading directory ${currentDir}:`)
    }
  }

  private async extractMetadata(
    filePath: string,
    folderPath: string,
  ): Promise<DockerProjectMetadata> {
    const rawContent = await fs.readFile(filePath, "utf-8")
    const parsedConfig = fromYaml(rawContent) as ComposeConfig

    const folderName = path.basename(folderPath)
    const projectName = parsedConfig.name || folderName

    const services: { name: string; image: string }[] = []

    if (parsedConfig.services) {
      for (const [serviceName, svc] of Object.entries(parsedConfig.services)) {
        const image =
          typeof svc === "object" && svc !== null && "image" in svc && typeof svc.image === "string"
            ? svc.image
            : ""

        services.push({
          name: serviceName,
          image,
        })
      }
    }

    return {
      projectName,
      configPath: filePath,
      folderPath,
      services,
    }
  }
}
