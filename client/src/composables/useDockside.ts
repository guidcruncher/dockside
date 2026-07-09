// src/composables/useDockside.ts
import { docksideClient } from "@/api"
import { ref } from "vue"

export function useDockside() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  function wrap<T>(fn: () => Promise<T>): Promise<T> {
    loading.value = true
    error.value = null
    return fn()
      .catch((e) => {
        error.value = e instanceof Error ? e.message : String(e)
        throw e
      })
      .finally(() => {
        loading.value = false
      })
  }

  return {
    loading,
    error,

    workspace: docksideClient.workspace,
    containers: docksideClient.containers,
    images: docksideClient.images,
    system: docksideClient.system,
    orchestration: docksideClient.orchestration,
    registry: docksideClient.registry,

    wrap,
  }
}
