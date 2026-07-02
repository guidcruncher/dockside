// composables/useNetworks.ts
import type { Network } from "@/types"
import { useRecordMap } from "./useRecordMap"

export function useNetworks(initial?: Record<string, Network | null>) {
  return useRecordMap<Network | null>(initial)
}
