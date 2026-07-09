import { ref } from "vue"
import { docksideClient } from "@/api"
import { useToasts } from "@/composables/useToasts"
import type {
  RegistryTagsResponse,
  RegistryMetadataResponse,
  RegistryManifestResponse,
  RegistryUpdateResponse,
} from "@/api"

export function useRegistry() {
  const tags = ref<RegistryTagsResponse>([])
  const metadata = ref<RegistryMetadataResponse | null>(null)
  const manifest = ref<RegistryManifestResponse | null>(null)
  const update = ref<RegistryUpdateResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const toasts = useToasts()

  async function load(imageRef: string) {
    loading.value = true
    error.value = null
    try {
      tags.value = await docksideClient.registry.tags(imageRef)
      metadata.value = await docksideClient.registry.metadata(imageRef)
      manifest.value = await docksideClient.registry.manifest(imageRef)
      update.value = await docksideClient.registry.update(imageRef)

      toasts.success("Registry data loaded")
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      error.value = msg
      toasts.error(msg)
    } finally {
      loading.value = false
    }
  }

  return {
    tags,
    metadata,
    manifest,
    update,
    loading,
    error,
    load,
    info: docksideClient.registry.info,
  }
}
