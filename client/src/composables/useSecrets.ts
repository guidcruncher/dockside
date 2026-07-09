// composables/useSecrets.ts
import type { Secret } from "@/types"
import { useRecordMap } from "./useRecordMap"

export function useSecrets(initial?: Record<string, Secret | null>) {
  return useRecordMap<Secret | null>(initial)
}
