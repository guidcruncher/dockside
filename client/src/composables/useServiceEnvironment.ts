// composables/useServiceEnvironment.ts
import { ref } from "vue"
import type { EnvironmentRecord } from "@/types"

export function useServiceEnvironment(initial?: EnvironmentRecord | string[]) {
  const env = ref<EnvironmentRecord>({})

  if (Array.isArray(initial)) {
    for (const line of initial) {
      const [k, v] = line.split("=")
      env.value[k] = v
    }
  } else if (initial) {
    env.value = { ...initial }
  }

  function set(key: string, value: string | number | boolean | null) {
    env.value[key] = value
  }

  function remove(key: string) {
    delete env.value[key]
  }

  return { env, set, remove }
}
