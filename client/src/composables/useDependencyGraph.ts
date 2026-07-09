import { computed, ref, watch } from "vue"
import { docksideClient } from "@/api"
import { useToasts } from "@/composables/useToasts"

export function useDependencyGraph(dsid?: string) {
  const dsId = ref<string | undefined>(dsid)
  const state = ref<any | undefined>()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const toasts = useToasts()

  const startupGraph = computed(() => state.value?.startupGraph ?? {})
  const shutdownGraph = computed(() => state.value?.shutdownGraph ?? {})
  const startupOrder = computed(() => state.value?.startupOrder ?? [])
  const shutdownOrder = computed(() => state.value?.shutdownOrder ?? [])

  async function refresh() {
    if (!dsId.value && dsId.value != "") return
    loading.value = true
    error.value = null
    try {
      state.value = await docksideClient.dependency.getDependencyGraph(dsId.value)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      error.value = msg
      toasts.error(msg)
    } finally {
      loading.value = false
    }
  }

  async function load(dsid: string): Promise<any> {
    loading.value = true
    error.value = null
    try {
      const res = await docksideClient.dependency.getDependencyGraph(dsid)
      return res
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      error.value = msg
      toasts.error(msg)
    } finally {
      loading.value = false
    }
  }

  watch(dsId, async () => {
    await refresh()
  })

  if (dsid) {
    dsId.value = dsid
  }

  return {
    graph: state,
    loading,
    error,
    refresh,
    load,
    dsId,
    startupGraph,
    shutdownGraph,
    startupOrder,
    shutdownOrder,
  }
}
