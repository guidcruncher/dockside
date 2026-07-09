import { ref, onMounted, onUnmounted } from "vue"
import type { SystemMonitorSnapshot } from "@/api"
import { docksideClient } from "@/api"
import { useToasts } from "@/composables/useToasts"

export function useSystemMonitor(intervalMs = 5000) {
  const snapshot = ref<SystemMonitorSnapshot | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const toasts = useToasts()

  let timer: number

  const fetchSnapshot = async () => {
    try {
      loading.value = true
      snapshot.value = await docksideClient.server.getSystemMonitorSnapshot()
      error.value = null
    } catch (e) {
      loading.value = false
      toasts.error(e instanceof Error ? e.message : String(e))
      throw e
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchSnapshot()
    timer = window.setInterval(fetchSnapshot, intervalMs)
  })

  onUnmounted(() => clearInterval(timer))

  return { snapshot, loading, error }
}
