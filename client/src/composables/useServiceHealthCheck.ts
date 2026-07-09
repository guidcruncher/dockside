// composables/useServiceHealthcheck.ts
import { ref } from "vue"
import type { ServiceHealthcheck } from "@/types"

export function useServiceHealthcheck(initial?: ServiceHealthcheck) {
  const health = ref<ServiceHealthcheck>(initial ?? {})

  function update(patch: Partial<ServiceHealthcheck>) {
    health.value = { ...health.value, ...patch }
  }

  return { health, update }
}
