// src/composables/useYamlNormalizer.ts
import { useComposeConfigNormalizer } from "./useComposeConfigNormalizer"
import type { ComposeConfig } from "@/types"

export function useYamlNormalizer() {
  const { normalizeComposeConfig } = useComposeConfigNormalizer()

  function normalizeYamlObject(raw: any): ComposeConfig {
    if (!raw || typeof raw !== "object") {
      return normalizeComposeConfig({})
    }

    return normalizeComposeConfig(raw)
  }

  return {
    normalizeYamlObject,
  }
}
