// composables/useService.ts
import { ref, computed } from "vue"
import type { Service } from "@/types"

export function useService(initial: Service) {
  const state = ref<Service>({ ...initial })

  function update(patch: Partial<Service>) {
    state.value = { ...state.value, ...patch }
  }

  const image = computed({
    get: () => state.value.image,
    set: (v) => update({ image: v }),
  })

  const environment = computed({
    get: () => state.value.environment,
    set: (v) => update({ environment: v }),
  })

  const ports = computed({
    get: () => state.value.ports ?? [],
    set: (v) => update({ ports: v }),
  })

  return {
    state,
    update,
    image,
    environment,
    ports,
  }
}
