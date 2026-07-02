// composables/useVolumes.ts
import type { Volume } from "@/types"
import { useRecordMap } from "./useRecordMap"

export function useVolumes(initial?: Record<string, Volume | null>) {
  return useRecordMap<Volume | null>(initial)
}
