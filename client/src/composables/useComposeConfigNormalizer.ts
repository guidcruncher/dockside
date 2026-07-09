// src/composables/useComposeConfigNormalizer.ts
import { useServiceNormalizer } from "./useServiceNormalizer"
import type { Service, ComposeConfig } from "@/types"

export function useComposeConfigNormalizer() {
  const { normalizeService } = useServiceNormalizer()

  function normalizeComposeConfig(raw: any): ComposeConfig {
    return {
      name: raw.name ?? "",
      version: raw.version ?? "3.9",

      services: normalizeServices(raw.services),
      networks: raw.networks ?? {},
      volumes: raw.volumes ?? {},
      secrets: raw.secrets ?? {},
      configs: raw.configs ?? {},
    }
  }

  function normalizeServices(services: any) {
    if (!services) return {}
    const out: Record<string, Service> = {}
    for (const [name, svc] of Object.entries(services)) {
      out[name] = normalizeService(name, svc)
    }
    return out
  }

  return {
    normalizeComposeConfig,
    normalizeServices,
  }
}
