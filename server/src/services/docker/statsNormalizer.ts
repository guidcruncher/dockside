import type { ContainerStatsResponse } from "./types.js"
import { roundFix } from "#/utils/math.js"

// CPU % (multi-core, matches docker stats)
export function calcCpuPercent(stats: ContainerStatsResponse): number {
  const cpu = stats.cpu_stats
  const precpu = stats.precpu_stats

  const cpuDelta = cpu.cpu_usage.total_usage - precpu.cpu_usage.total_usage

  const systemDelta = (cpu.system_cpu_usage ?? 0) - (precpu.system_cpu_usage ?? 0)

  const onlineCpus = cpu.online_cpus ?? 1

  if (cpuDelta <= 0 || systemDelta <= 0) return 0

  const v = (cpuDelta / systemDelta) * onlineCpus * 100 * 100
  return roundFix(v, 2)
}

// CPU % normalized to 0–100 (single-core)
export function calcCpuPercentNormalized(stats: ContainerStatsResponse): number {
  const raw = calcCpuPercent(stats)
  const cpus = stats.cpu_stats.online_cpus ?? 1
  return roundFix(raw / cpus, 2)
}

// Memory % (Docker-accurate: subtract cache)
export function calcMemoryPercent(stats: ContainerStatsResponse): number {
  const usage = stats.memory_stats.usage ?? 0
  const limit = stats.memory_stats.limit ?? 0

  const cache = stats.memory_stats.stats?.cache ?? stats.memory_stats.stats?.inactive_file ?? 0

  const workingSet = usage - cache
  if (limit === 0) return 0

  const v = (workingSet / limit) * 100 * 100
  if (v > 100) return 100
  return roundFix(v, 2)
}

// Network totals
export function calcNetworkTotals(stats: ContainerStatsResponse) {
  const nets = stats.networks ?? {}

  let rx = 0
  let tx = 0

  for (const iface of Object.values(nets)) {
    rx += iface.rx_bytes
    tx += iface.tx_bytes
  }

  return { rx, tx }
}

// Block I/O totals
export function calcBlkioTotals(stats: ContainerStatsResponse) {
  const blk = stats.blkio_stats ?? {}

  let read = 0
  let write = 0

  const entries = blk.io_service_bytes_recursive ?? []
  if (entries) {
    for (const e of entries) {
      if (e.op === "read") read += e.value
      if (e.op === "write") write += e.value
    }
  }

  return { read, write }
}

export function normalizeStats(stats: ContainerStatsResponse) {
  const cpuPercent = calcCpuPercent(stats)
  const cpuPercentNormalized = calcCpuPercentNormalized(stats)
  const memoryPercent = calcMemoryPercent(stats)
  const network = calcNetworkTotals(stats)
  const blkio = calcBlkioTotals(stats)

  return {
    id: stats.id,
    name: stats.name,
    osType: stats.os_type,
    read: stats.read,

    cpu: {
      percent: cpuPercent,
      percentNormalized: cpuPercentNormalized,
      cores: stats.cpu_stats.online_cpus ?? 1,
    },

    memory: {
      percent: memoryPercent,
      usage: stats.memory_stats.usage,
      limit: stats.memory_stats.limit,
    },

    network,
    blkio,

    pids: stats.pids_stats.current ?? 0,
  }
}
