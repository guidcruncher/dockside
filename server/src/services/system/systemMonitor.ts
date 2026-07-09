import type { MemoryStatus, CpuCoreStatus, SystemMonitorSnapshot } from "./types.js"
import { roundFix } from "#/utils/math.js"

import * as fs from "fs/promises"

export class SystemMonitor {
  private prevStats: Map<string, { total: number; idle: number }> = new Map()

  kbToGb(kb: number): number {
    return roundFix(kb / 1_000_000, 2)
  }

  public async getSnapshot(): Promise<SystemMonitorSnapshot> {
    const [cpuCores, memory] = await Promise.all([this.getCpuSnapshot(), this.getMemorySnapshot()])

    return {
      timestamp: Date.now(),
      cores: cpuCores,
      memory,
    }
  }

  private async getCpuSnapshot(): Promise<CpuCoreStatus[]> {
    const statsContent = await fs.readFile("/proc/stat", "utf8")
    const lines = statsContent.split("\n")
    const cores: CpuCoreStatus[] = []

    for (const line of lines) {
      const parts = line.split(/\s+/)
      const coreLabel = parts[0]

      if (!coreLabel || !/^cpu\d+$/.test(coreLabel)) continue

      const coreId = parseInt(coreLabel.replace("cpu", ""), 10)
      const [freqResult] = await Promise.allSettled([this.readFreqAsync(coreId)])
      const frequencyMhz = freqResult.status === "fulfilled" ? freqResult.value : 0

      cores.push({
        coreId,
        frequencyMhz,
        loadPercentage: this.calculateLoad(coreLabel, parts),
      })
    }
    return cores
  }

  private async getMemorySnapshot(): Promise<MemoryStatus> {
    const content = await fs.readFile("/proc/meminfo", "utf8")
    const lines = content.split("\n")
    const data: Record<string, number> = {}

    for (const line of lines) {
      const [key, valPart] = line.split(":")
      if (key && valPart) {
        data[key.trim()] = parseInt(valPart.trim().replace(/\D/g, ""), 10)
      }
    }

    const total = data["MemTotal"] || 0
    const available = data["MemAvailable"] || 0

    // Calculate percentage: (Total - Available) / Total
    const usedPercentage = total > 0 ? Math.round(((total - available) / total) * 100) : 0

    return {
      totalKb: total,
      totalGb: this.kbToGb(total),
      freeKb: data["MemFree"] || 0,
      freeGb: this.kbToGb(data["MemFree"] || 0),
      availableKb: available,
      availableGb: this.kbToGb(available),
      usedPercentage,
    }
  }

  private calculateLoad(label: string, parts: string[]): number {
    const parse = (index: number): number => (parts[index] ? parseInt(parts[index], 10) : 0)
    const total =
      parse(1) + parse(2) + parse(3) + parse(4) + parse(5) + parse(6) + parse(7) + parse(8)
    const idleTime = parse(4) + parse(5)

    const prev = this.prevStats.get(label)
    this.prevStats.set(label, { total, idle: idleTime })

    if (!prev) return 0
    const totalDelta = total - prev.total
    const idleDelta = idleTime - prev.idle
    return totalDelta === 0 ? 0 : Math.round(((totalDelta - idleDelta) / totalDelta) * 100)
  }

  private async readFreqAsync(id: number): Promise<number> {
    try {
      const data = await fs.readFile(
        `/sys/devices/system/cpu/cpu${id}/cpufreq/scaling_cur_freq`,
        "utf8",
      )
      return parseInt(data.trim(), 10) / 1000
    } catch {
      return 0
    }
  }
}
