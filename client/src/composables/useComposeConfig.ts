// composables/useComposeConfig.ts
import { ref, computed } from "vue"
import type { ComposeConfig, Service, Network, Volume, Secret, Config } from "@/types"
import { useRecordMap } from "./useRecordMap"

export function useComposeConfig(initial?: ComposeConfig) {
  const name = ref(initial?.name ?? "")
  const version = ref(initial?.version ?? "3.9")

  const services = useRecordMap<Service>(initial?.services)
  const networks = useRecordMap<Network | null>(initial?.networks)
  const volumes = useRecordMap<Volume | null>(initial?.volumes)
  const secrets = useRecordMap<Secret>(initial?.secrets)
  const configs = useRecordMap<Config>(initial?.configs)

  const config = computed<ComposeConfig>(() => ({
    name: name.value || undefined,
    version: version.value,
    services: services.map.value,
    networks: networks.map.value,
    volumes: volumes.map.value,
    secrets: secrets.map.value,
    configs: configs.map.value,
  }))

  return {
    name,
    version,
    services,
    networks,
    volumes,
    secrets,
    configs,
    config,
  }
}
