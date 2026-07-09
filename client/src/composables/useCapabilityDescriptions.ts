// src/composables/useCapabilityDescriptions.ts
import { ref, computed } from "vue"
import type { LinuxCapability, LinuxCapabilityDescriptions } from "@/types"
import { LinuxCapabilityDescription } from "@/types"

export function useCapabilityDescriptions() {
  // Fully typed, reactive description map
  const descriptions = ref<LinuxCapabilityDescriptions>(LinuxCapabilityDescription)

  // Typed list of all capabilities
  const allCapabilities = computed<LinuxCapability[]>(
    () => Object.keys(descriptions.value) as LinuxCapability[],
  )

  // Safe lookup helper
  function getDescription(cap: LinuxCapability): string {
    return descriptions.value[cap]
  }

  // Useful for v-for in UI components
  const entries = computed(() =>
    allCapabilities.value.map((cap) => ({
      cap,
      description: descriptions.value[cap],
    })),
  )

  return {
    descriptions,
    allCapabilities,
    getDescription,
    entries,
  }
}
