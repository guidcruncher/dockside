import { ref } from "vue"
import { docksideClient } from "@/api"
import { useToasts } from "@/composables/useToasts"
import type { DockerContainerSummary } from "@/api"

export function useContainers() {
  const containers = ref<DockerContainerSummary[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const toasts = useToasts()

  async function refresh(params?: { all?: boolean; limit?: number }) {
    loading.value = true
    error.value = null
    try {
      containers.value = await docksideClient.containers.list(params)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      error.value = msg
      toasts.error(msg)
    } finally {
      loading.value = false
    }
  }

  async function start(id: string) {
    try {
      await docksideClient.containers.start(id)
      toasts.success("Container started")
    } catch (e) {
      toasts.error(e instanceof Error ? e.message : String(e))
      throw e
    }
  }

  async function stop(id: string, params?: { t?: number }) {
    try {
      await docksideClient.containers.stop(id, params)
      toasts.success("Container stopped")
    } catch (e) {
      toasts.error(e instanceof Error ? e.message : String(e))
      throw e
    }
  }

  async function restart(id: string, params?: { t?: number }) {
    try {
      await docksideClient.containers.restart(id, params)
      toasts.success("Container restarted")
    } catch (e) {
      toasts.error(e instanceof Error ? e.message : String(e))
      throw e
    }
  }

  async function remove(id: string, params?: { force?: boolean; v?: boolean }) {
    try {
      await docksideClient.containers.remove(id, params)
      toasts.success("Container removed")
    } catch (e) {
      toasts.error(e instanceof Error ? e.message : String(e))
      throw e
    }
  }

  return {
    containers,
    loading,
    error,
    refresh,
    inspect: docksideClient.containers.inspect,
    logs: docksideClient.containers.logs,
    start,
    stop,
    restart,
    remove,
  }
}
