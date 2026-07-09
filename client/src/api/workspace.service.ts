import { BaseClient } from "./dockside-sdk"
import type { ComposeConfig } from "@/types"

export type WorkspaceStatus = "unknown" | "running" | "syncing" | "stopped" | "error"

export interface WorkspaceService {
  name: string
  image: string
  state: "running" | "stopped" | "starting" | "error" | "unknown"
  health: "healthy" | "unhealthy" | "starting" | "none"
}

export interface WorkspaceProjectState {
  projectName: string
  configPath: string
  folderPath: string
  dsId: string
  status: WorkspaceStatus
  isFavorite: boolean
  services: WorkspaceService[]
}

export interface WorkspaceState {
  rootPath: string | null
  isLoading: boolean
  error: string | null
  projects: Record<string, WorkspaceProjectState>
  lastSyncedAt: string | null
}

export interface CreateProjectRequest {
  projectName: string
  services: any[]
  config: ComposeConfig
}

export interface CreateProjectResponse {
  success: boolean
  dsId: string
}

export interface ToggleFavoriteResponse {
  success: boolean
}

export interface UpdateProjectStatusRequest {
  dsId: string
  status: Exclude<WorkspaceStatus, "syncing">
}

export interface UpdateProjectStatusResponse {
  success: boolean
}

export class WorkspaceClient extends BaseClient {
  constructor(baseUrl: string, fetchImpl: typeof fetch) {
    super(baseUrl, fetchImpl)
  }

  getState(): Promise<WorkspaceState> {
    return this.request("/api/v1/workspace/state")
  }

  createProject(body: CreateProjectRequest): Promise<CreateProjectResponse> {
    return this.request("/api/v1/workspace/projects", {
      method: "POST",
      body: JSON.stringify(body),
    })
  }

  toggleFavorite(dsId: string): Promise<ToggleFavoriteResponse> {
    return this.request(`/api/v1/workspace/projects/${encodeURIComponent(dsId)}/favorite`, {
      method: "POST",
    })
  }

  updateStatus(body: UpdateProjectStatusRequest): Promise<UpdateProjectStatusResponse> {
    return this.request("/api/v1/workspace/projects/status", {
      method: "PUT",
      body: JSON.stringify(body),
    })
  }

  getCompose(dsId: string): Promise<ComposeConfig> {
    return this.request(`/api/v1/workspace/projects/${encodeURIComponent(dsId)}/compose`)
  }

  saveCompose(dsId: string, config: ComposeConfig): Promise<void> {
    return this.request(`/api/v1/workspace/projects/${encodeURIComponent(dsId)}/compose/save`, {
      method: "POST",
      body: JSON.stringify(config),
    })
  }
}
