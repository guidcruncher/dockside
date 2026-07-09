// composables/useRecordMap.ts
import { ref } from "vue"

export function useRecordMap<T extends object | null>(initial?: Record<string, T>) {
  const map = ref<Record<string, T>>(initial ?? {})

  function set(key: string, value: T) {
    map.value[key] = value
  }

  function remove(key: string) {
    delete map.value[key]
  }

  function update(key: string, patch: Partial<Exclude<T, null>>) {
    if (map.value[key] !== null) {
      map.value[key] = { ...(map.value[key] as object), ...patch } as T
    }
  }

  return { map, set, remove, update }
}
