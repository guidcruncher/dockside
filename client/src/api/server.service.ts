import { BaseClient } from "./dockside-sdk"

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

export class ServerClient extends BaseClient {
  constructor(baseUrl: string, fetchImpl: typeof fetch) {
    super(baseUrl, fetchImpl)
  }

  getSystemMonitorSnapshot(): Promise<SystemMonitorSnapshot> {
    return this.request("/api/v1/server/cores")
  }
}
