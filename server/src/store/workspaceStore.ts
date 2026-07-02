import * as fs from "node:fs/promises"
import { existsSync } from "node:fs"
import * as path from "node:path"
import * as crypto from "node:crypto"
import {
  type DockerProjectMetadata,
  DockerFolderScanner,
} from "#/services/compose/composeFolderScanner.js"
import type { WorkspaceState, ManagedProject, WorkspaceListener } from "./types.js"
import { toYaml, fromYaml } from "#/services/compose/composeConverter.js"
import type { ComposeConfig } from "#/services/compose/types.js"

// --- Normalisation helper ----------------------------------------------

export function normalizeServices(services: any[]): { name: string }[] {
  return services.map((s) => ({ name: s.name, image: s.image }))
}

// --- Persisted Types ----------------------------------------------------

export interface PersistedProjectState {
  status: ManagedProject["status"]
  isFavorite: boolean
  dsId: string
  projectName: string
  configPath: string
  folderPath: string
  services: any[]
}

export interface PersistedWorkspaceData {
  lastSyncedAt: string | null
  projects: Record<string, PersistedProjectState>
}

// --- Main Store ---------------------------------------------------------

export class PersistentWorkspaceStore {
  private listeners: Set<WorkspaceListener> = new Set()
  private stateFile: string | null = null
  private state: WorkspaceState = {
    rootPath: null,
    isLoading: false,
    error: null,
    projects: {},
    lastSyncedAt: null,
  }

  constructor(private scanner: DockerFolderScanner) {}

  public getState(): Readonly<WorkspaceState> {
    return this.state
  }

  public subscribe(listener: WorkspaceListener): () => void {
    this.listeners.add(listener)
    listener(this.state)
    return () => this.listeners.delete(listener)
  }

  // ---------------------------------------------------------------------
  // Workspace Root Initialisation
  // ---------------------------------------------------------------------

  public async setWorkspaceRoot(): Promise<void> {
    this.stateFile = path.join(this.scanner.workspaceRoot, ".workspace-state.json")
    this.updateState({
      rootPath: this.scanner.workspaceRoot,
      isLoading: true,
      error: null,
      projects: {},
    })

    const savedData = await this.loadFromDisk()

    try {
      const discovered = await this.scanner.scanDirectory()
      const mergedProjects: Record<string, ManagedProject> = {}

      for (const project of discovered) {
        const relativePath = path.relative(this.scanner.workspaceRoot, project.folderPath)
        const savedProject = savedData?.projects[relativePath]

        await this.saveComposeJsonFromYaml(project)

        const dsId = savedProject?.dsId ?? crypto.randomUUID()

        mergedProjects[project.folderPath] = {
          ...project,
          dsId,
          status: savedProject ? savedProject.status : "unknown",
          isFavorite: savedProject?.isFavorite ?? false,
          services: normalizeServices(savedProject?.services ?? project.services),
        }
      }

      this.updateState({
        projects: mergedProjects,
        isLoading: false,
        lastSyncedAt: savedData?.lastSyncedAt ? new Date(savedData.lastSyncedAt) : new Date(),
      })

      await this.saveToDisk()
    } catch (err) {
      this.updateState({
        isLoading: false,
        error: `Initialization scan failed: ${(err as Error).message}`,
      })
    }
  }

  // ---------------------------------------------------------------------
  // Project Mutations
  // ---------------------------------------------------------------------

  public async updateProjectStatus(
    folderPath: string,
    status: ManagedProject["status"],
  ): Promise<void> {
    const existingProject = this.state.projects[folderPath]
    if (!existingProject) return

    const updatedProjects = { ...this.state.projects }
    updatedProjects[folderPath] = { ...existingProject, status }

    this.updateState({ projects: updatedProjects })
    await this.saveToDisk()
  }

  public async toggleFavorite(folderPath: string): Promise<void> {
    const existingProject = this.state.projects[folderPath]
    if (!existingProject) return

    const updatedProjects = { ...this.state.projects }
    updatedProjects[folderPath] = {
      ...existingProject,
      isFavorite: !existingProject.isFavorite,
    }

    this.updateState({ projects: updatedProjects })
    await this.saveToDisk()
  }

  // ---------------------------------------------------------------------
  // Project Creation
  // ---------------------------------------------------------------------

  public async create(projectName: string, initialConfig: ComposeConfig): Promise<string> {
    if (!this.state.rootPath) {
      throw new Error("Cannot create project: Workspace root directory is not set.")
    }

    const folderPath = path.join(this.state.rootPath, projectName)
    const configPath = path.join(folderPath, "compose.yaml")
    const outputFilename = path.join(folderPath, ".compose.json")

    if (existsSync(folderPath)) {
      throw new Error(`Directory path already exists on filesystem: ${folderPath}`)
    }

    await fs.mkdir(folderPath, { recursive: true })
    await fs.mkdir(path.join(folderPath, ".history"))

    const rawYaml = toYaml(initialConfig)
    await fs.writeFile(configPath, rawYaml, "utf-8")
    await fs.writeFile(outputFilename, JSON.stringify(initialConfig, null, 2), "utf-8")

    const serviceNames = initialConfig.services ? Object.keys(initialConfig.services) : []

    const projectMetadata: DockerProjectMetadata = {
      projectName,
      folderPath,
      configPath,
      services: normalizeServices(serviceNames),
    }

    const updatedProjects = { ...this.state.projects }
    const generatedDsId = crypto.randomUUID()

    updatedProjects[folderPath] = {
      ...projectMetadata,
      dsId: generatedDsId,
      status: "unknown",
      isFavorite: false,
    }

    this.updateState({
      projects: updatedProjects,
      lastSyncedAt: new Date(),
    })

    await this.saveToDisk()
    return generatedDsId
  }

  // ---------------------------------------------------------------------
  // Persistence
  // ---------------------------------------------------------------------

  private async saveToDisk(): Promise<void> {
    if (!this.stateFile || !this.state.rootPath) return
    try {
      const exportData: PersistedWorkspaceData = {
        lastSyncedAt: this.state.lastSyncedAt?.toISOString() ?? null,
        projects: {},
      }

      for (const [absolutePath, project] of Object.entries(this.state.projects)) {
        if (!project) continue
        const relativeKey = path.relative(this.state.rootPath, absolutePath)

        exportData.projects[relativeKey] = {
          status: project.status,
          isFavorite: project.isFavorite ?? false,
          dsId: project.dsId,
          services: normalizeServices(project.services),
          projectName: project.projectName,
          folderPath: project.folderPath,
          configPath: project.configPath,
        }
      }

      await fs.writeFile(this.stateFile, JSON.stringify(exportData, null, 2), "utf-8")
    } catch (error) {
      console.error("Failed to write workspace state to disk:", error)
    }
  }

  private isIdentical(str1: string, str2: string): boolean {
    const cleanString1 = str1.replace(/\r/g, "").trim()
    const cleanString2 = str2.replace(/\r/g, "").trim()
    return cleanString1 === cleanString2
  }

  public async saveComposeJson(prj: DockerProjectMetadata, config: ComposeConfig): Promise<void> {
    const history = path.join(prj.folderPath, ".history")
    const now = Date.now()
    const historyYaml = path.join(history, `compose-${now}.yaml`)
    const historyFile = path.join(history, `compose-${now}.json`)
    const outputFilename = path.join(prj.folderPath, ".compose.json")
    const newYml = toYaml(config)
    const oldYml = await fs.readFile(prj.configPath, "utf-8")
    if (!existsSync(history)) {
      await fs.mkdir(history)
    }

    if (!this.isIdentical(newYml, oldYml)) {
      try {
        await fs.access(outputFilename, fs.constants.R_OK | fs.constants.W_OK)
        if (!existsSync(history)) {
          await fs.mkdir(history)
        }
        await fs.copyFile(outputFilename, historyFile)
      } catch {}
      await fs.writeFile(outputFilename, JSON.stringify(config, null, 2), "utf-8")
      await fs.copyFile(prj.configPath, `${prj.configPath}.bak`)
      await fs.copyFile(prj.configPath, historyYaml)
      await fs.writeFile(prj.configPath, newYml, "utf-8")
    }
  }

  public async saveComposeJsonFromYaml(prj: DockerProjectMetadata): Promise<void> {
    const filename = path.join(prj.configPath)
    const rawData = await fs.readFile(filename, "utf-8")
    const json: ComposeConfig = fromYaml(rawData)
    await this.saveComposeJson(prj, json)
  }

  public async loadComposeJson(prj: DockerProjectMetadata): Promise<ComposeConfig> {
    const filename = path.join(prj.configPath)
    const rawData = await fs.readFile(filename, "utf-8")
    const json: ComposeConfig = fromYaml(rawData)
    await this.saveComposeJson(prj, json)
    return json
  }

  public find(dsId: string): any {
    const projects = this.getState().projects
    return Object.values(projects).find((project: any) => project?.dsId === dsId)
  }

  private async loadFromDisk(): Promise<PersistedWorkspaceData | null> {
    if (!this.stateFile) return null
    try {
      const rawData = await fs.readFile(this.stateFile, "utf-8")
      return JSON.parse(rawData) as PersistedWorkspaceData
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null
      }
      console.error("Failed to read or parse workspace state from disk:", error)
      return null
    }
  }

  private updateState(newStatePartial: Partial<WorkspaceState>): void {
    this.state = { ...this.state, ...newStatePartial }
    this.listeners.forEach((listener) => listener(this.state))
  }
}
