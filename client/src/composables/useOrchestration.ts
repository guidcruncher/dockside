import { ref } from "vue"
import { docksideClient } from "@/api"
import { useToasts } from "@/composables/useToasts"
import type { DockerNetwork, DockerVolume } from "@/api"

export function useOrchestration() {
  const networks = ref<DockerNetwork[]>([])
  const volumes = ref<DockerVolume[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const toasts = useToasts()

  async function refresh() {
    loading.value = true
    error.value = null
    try {
      networks.value = await docksideClient.orchestration.listNetworks()
      volumes.value = await docksideClient.orchestration.listVolumes()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      error.value = msg
      toasts.error(msg)
    } finally {
      loading.value = false
    }
  }

  async function deploy(dsId: string) {
    try {
      const result = await docksideClient.orchestration.deploy(dsId)
      if (result.errors.length === 0) {
        toasts.success("Stack deployed successfully")
      } else {
        toasts.error("Deployment completed with errors")
      }
      return result
    } catch (e) {
      toasts.error(e instanceof Error ? e.message : String(e))
      throw e
    }
  }

  return {
    networks,
    volumes,
    loading,
    error,
    refresh,
    deploy,
    getComposeLink: docksideClient.orchestration.getComposeLink,
  }
}
