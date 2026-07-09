// composables/useServiceDeploy.ts
import { ref } from "vue"
import type { ServiceDeploy } from "@/types"

export function useServiceDeploy(initial?: ServiceDeploy) {
  const deploy = ref<ServiceDeploy>(initial ?? {})

  function update(patch: Partial<ServiceDeploy>) {
    deploy.value = { ...deploy.value, ...patch }
  }

  return { deploy, update }
}
