import { ref } from "vue"
import { docksideClient } from "@/api"
import { useToasts } from "@/composables/useToasts"
import type { WorkspaceProjectState, WorkspaceState } from "@/api"
import type { ComposeConfig } from "@/types"

export function useWorkspace() {
  const state = ref<WorkspaceState | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const toasts = useToasts()

  async function refresh() {
    loading.value = true
    error.value = null
    try {
      state.value = await docksideClient.workspace.getState()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      error.value = msg
      toasts.error(msg)
    } finally {
      loading.value = false
    }
  }

  async function createProject(body: any) {
    try {
      const result = await docksideClient.workspace.createProject(body)
      toasts.success("Project created")
      return result
    } catch (e) {
      toasts.error(e instanceof Error ? e.message : String(e))
      throw e
    }
  }

  async function saveCompose(dsId: string, config: ComposeConfig) {
    try {
      await docksideClient.workspace.saveCompose(dsId, config)
      toasts.success("Compose saved")
    } catch (e) {
      toasts.error(e instanceof Error ? e.message : String(e))
      throw e
    }
  }

  async function getCompose(dsId: string): Promise<ComposeConfig> {
    try {
      return docksideClient.workspace.getCompose(dsId)
    } catch (e) {
      toasts.error(e instanceof Error ? e.message : String(e))
      throw e
    }
  }

  function findProjectInState(
    rec: Record<string, WorkspaceProjectState>,
    dsId: string,
  ): { key: string; value: WorkspaceProjectState } | undefined {
    const first = Object.entries(rec).find(([_, v]) => v.dsId == dsId)
    if (!first) return undefined

    const [key, value] = first
    return { key, value }
  }

  async function getWorkspaceProject(
    dsId: string,
  ): Promise<{ key: string; value: WorkspaceProjectState } | undefined> {
    try {
      if (!state.value) {
        await refresh()
        if (!state.value) return undefined
      }
      const first = findProjectInState(state.value.projects, dsId)

      return first
    } catch (e) {
      toasts.error(e instanceof Error ? e.message : String(e))
      throw e
    }
  }

  async function updateStatus(body: any) {
    try {
      await docksideClient.workspace.updateStatus(body)
      toasts.success("Status updated")
    } catch (e) {
      toasts.error(e instanceof Error ? e.message : String(e))
      throw e
    }
  }

  return {
    state,
    loading,
    error,
    refresh,
    createProject,
    toggleFavorite: docksideClient.workspace.toggleFavorite,
    updateStatus,
    getCompose,
    getWorkspaceProject,
    saveCompose,
  }
}
