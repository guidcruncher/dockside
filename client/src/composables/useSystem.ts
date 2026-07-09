import { ref } from "vue"
import { docksideClient } from "@/api"
import { useToasts } from "@/composables/useToasts"
import type { DockerVersionInfo, DockerSystemInfo, SystemDescriptor } from "@/api"

export function useSystem() {
  const version = ref<DockerVersionInfo | null>(null)
  const info = ref<DockerSystemInfo | null>(null)
  const descriptor = ref<SystemDescriptor | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const toasts = useToasts()

  async function refresh() {
    loading.value = true
    error.value = null
    try {
      version.value = await docksideClient.system.version()
      info.value = await docksideClient.system.info()
      descriptor.value = await docksideClient.system.descriptor()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      error.value = msg
      toasts.error(msg)
    } finally {
      loading.value = false
    }
  }

  async function prune() {
    try {
      await docksideClient.system.prune()
      toasts.success("System pruned")
    } catch (e) {
      toasts.error(e instanceof Error ? e.message : String(e))
      throw e
    }
  }

  return {
    version,
    info,
    descriptor,
    loading,
    error,
    refresh,
    prune,
  }
}
