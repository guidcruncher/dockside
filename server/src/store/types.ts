// ==========================================
// Store and State Typings
// ==========================================

import { type DockerProjectMetadata } from "#/services/compose/composeFolderScanner.js"

export interface ManagedProject extends DockerProjectMetadata {
  dsId: string
  status: "unknown" | "running" | "stopped" | "syncing" | "error"
  isFavorite?: boolean
}

export interface WorkspaceState {
  rootPath: string | null
  isLoading: boolean
  error: string | null
  projects: Record<string, ManagedProject>
  lastSyncedAt: Date | null
}

export type WorkspaceListener = (state: WorkspaceState) => void

export interface PersistedWorkspaceData {
  lastSyncedAt: string | null
  projects: Record<
    string,
    {
      isFavorite: boolean
      status: "unknown" | "running" | "stopped" | "syncing"
    }
  >
}
