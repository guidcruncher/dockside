export interface CpuCoreStatus {
  coreId: number
  frequencyMhz: number
  loadPercentage: number
}

export interface MemoryStatus {
  totalKb: number
  totalGb: number
  freeKb: number
  freeGb: number
  availableKb: number
  availableGb: number
  usedPercentage: number // Added field
}

export interface SystemMonitorSnapshot {
  timestamp: number
  cores: CpuCoreStatus[]
  memory: MemoryStatus
}
