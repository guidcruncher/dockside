import { ref } from "vue"
import { docksideClient } from "@/api"
import { useToasts } from "@/composables/useToasts"
import type { ProxyConfig } from "@/api"

export function useProxy() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const toasts = useToasts()
  const config = ref<ProxyConfig | undefined>()
  const project = ref()

  async function getConfig(proj: any) {
    loading.value = true
    error.value = null
    try {
      const res = await docksideClient.proxy.getProxyConfig(proj.dsId)
      config.value = res
      project.value = proj
      return res
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      error.value = msg
      toasts.error(msg)
    } finally {
      loading.value = false
    }
  }

  async function updateConfig() {
    error.value = null
    try {
      if (!project.value || !config.value) return
      const res = await docksideClient.proxy.saveProxyConfig(
        project.value.projectName,
        config.value,
      )
      return res
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      error.value = msg
      toasts.error(msg)
    }
  }

  return {
    project,
    getConfig,
    updateConfig,
    config,
    loading,
    error,
  }
}
