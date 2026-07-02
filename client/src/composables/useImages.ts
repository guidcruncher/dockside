import { ref } from "vue"
import { docksideClient } from "@/api"
import { useToasts } from "@/composables/useToasts"
import type { DockerImageSummary } from "@/api"

export function useImages() {
  const images = ref<DockerImageSummary[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const toasts = useToasts()

  async function refresh() {
    loading.value = true
    error.value = null
    try {
      images.value = await docksideClient.images.list()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      error.value = msg
      toasts.error(msg)
    } finally {
      loading.value = false
    }
  }

  async function remove(name: string, params?: { force?: boolean }) {
    try {
      await docksideClient.images.remove(name, params)
      toasts.success("Image removed")
    } catch (e) {
      toasts.error(e instanceof Error ? e.message : String(e))
      throw e
    }
  }

  return {
    images,
    loading,
    error,
    refresh,
    inspect: docksideClient.images.inspect,
    remove,
  }
}
