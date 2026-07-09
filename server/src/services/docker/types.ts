// -----------------------------------------------------------------------------
// DockSide Types
// -----------------------------------------------------------------------------

export const DockSideId = "com.dockside.project_id"

export interface ComposeLinkInfo {
  dsId: string | undefined
  projectName: string
  serviceName: string
  workingDir: string
  configFile: string
}

// -----------------------------------------------------------------------------
// Docker API v1.54 Types
// -----------------------------------------------------------------------------

// System Version ---------------------------------------------------------------

export interface SystemVersion {
  Version: string
  ApiVersion: string
  MinAPIVersion: string
  GitCommit: string
  GoVersion: string
  Os: string
  Arch: string
  Variant?: string
  KernelVersion: string
  BuildTime: string
  Platform?: { Name: string }
  Components?: Array<{
    Name: string
    Version: string
    Details?: Record<string, string>
  }>
}

// System Info ------------------------------------------------------------------

export interface SystemInfo {
  ID: string
  Containers: number
  ContainersRunning: number
  ContainersPaused: number
  ContainersStopped: number
  Images: number
  Driver: string
  DriverStatus?: Array<[string, string]>
  Plugins?: {
    Volume?: string[]
    Network?: string[]
    Authorization?: string[]
    Log?: string[]
  }
  MemoryLimit: boolean
  SwapLimit: boolean
  KernelMemory: boolean
  CpuCfsPeriod: boolean
  CpuCfsQuota: boolean
  CPUShares: boolean
  CPUSet: boolean
  IPv4Forwarding: boolean
  BridgeNfIptables: boolean
  BridgeNfIp6tables: boolean
  Debug: boolean
  NFd: number
  OomKillDisable: boolean
  NGoroutines: number
  SystemTime: string
  LoggingDriver: string
  CgroupDriver: string
  CgroupVersion?: string
  KernelVersion: string
  OperatingSystem: string
  OSType: string
  Architecture: string
  NCPU: number
  MemTotal: number
  DockerRootDir: string
  HttpProxy?: string
  HttpsProxy?: string
  NoProxy?: string
  Name: string
  ServerVersion: string
  Runtimes?: Record<string, { path: string }>
  DefaultRuntime?: string
  Swarm?: Record<string, unknown>
  LiveRestoreEnabled?: boolean
}

// Container Summary ------------------------------------------------------------

export interface ContainerSummaryResponse {
  Id: string
  Names: string[]
  Image: string
  ImageID: string
  Command: string
  Created: number
  State: string
  Status: string
  Ports?: Array<{
    PrivatePort: number
    PublicPort?: number
    Type: string
    IP?: string
  }>
  Labels?: Record<string, string>
  SizeRw?: number
  SizeRootFs?: number
  HostConfig?: { NetworkMode: string }
  NetworkSettings?: { Networks: Record<string, unknown> }
  Mounts?: Array<{
    Type: string
    Name?: string
    Source: string
    Destination: string
    Driver?: string
    Mode: string
    RW: boolean
    Propagation: string
  }>
}

// Container Inspect ------------------------------------------------------------

export interface ContainerInspectResponse {
  Id: string
  Created: string
  Path: string
  Args: string[]
  Name: string
  RestartCount: number
  Driver: string
  Platform?: string
  State: {
    Status: string
    Running: boolean
    Paused: boolean
    Restarting: boolean
    OOMKilled: boolean
    Dead: boolean
    Pid: number
    ExitCode: number
    Error: string
    StartedAt: string
    FinishedAt: string
  }
  Image: string
  ResolvConfPath: string
  HostnamePath: string
  HostsPath: string
  LogPath: string
  Node?: Record<string, unknown>
  MountLabel?: string
  ProcessLabel?: string
  AppArmorProfile?: string
  ExecIDs?: string[] | null
  HostConfig: Record<string, unknown>
  GraphDriver: {
    Name: string
    Data: Record<string, string>
  }
  Mounts: Array<{
    Type: string
    Name?: string
    Source: string
    Destination: string
    Driver?: string
    Mode: string
    RW: boolean
    Propagation: string
  }>
  Config: {
    Hostname: string
    Domainname: string
    User: string
    AttachStdin: boolean
    AttachStdout: boolean
    AttachStderr: boolean
    ExposedPorts?: Record<string, unknown>
    Tty: boolean
    OpenStdin: boolean
    StdinOnce: boolean
    Env: string[]
    Cmd: string[] | null
    Image: string
    Volumes?: Record<string, unknown>
    WorkingDir: string
    Entrypoint?: string[] | null
    Labels?: Record<string, string>
  }
  NetworkSettings: Record<string, unknown>
}

// Container Create -------------------------------------------------------------

export interface ContainerCreateResponse {
  Id: string
  Warnings?: string[] | null
}

// Image Summary ----------------------------------------------------------------

export interface ImageSummary {
  Id: string
  ParentId: string
  RepoTags?: string[] | null
  RepoDigests?: string[] | null
  Created: number
  Size: number
  SharedSize: number
  VirtualSize?: number
  Labels?: Record<string, string>
  Containers: number
}

// Image Inspect ----------------------------------------------------------------

export interface ImageInspectResponse {
  Id: string
  RepoTags?: string[] | null
  RepoDigests?: string[] | null
  Created: string
  Size: number
  VirtualSize?: number
  Architecture: string
  Os: string
  OsVersion?: string | null
  Variant?: string | null
  Author?: string
  Comment?: string
  Config?: {
    User?: string
    Env?: string[]
    Cmd?: string[]
    Entrypoint?: string[]
    WorkingDir?: string
    Labels?: Record<string, string>
  }
  RootFS?: {
    Type?: string
    Layers?: string[]
  }
  GraphDriver?: {
    Name: string
    Data: Record<string, string>
  }
}

// Exec Create ------------------------------------------------------------------

export interface ExecCreateResponse {
  Id: string
}

// Events -----------------------------------------------------------------------

export interface EventMessage {
  Type: string
  Action: string
  Actor: {
    ID: string
    Attributes: Record<string, string>
  }
  time: number
  timeNano: number
  scope?: string
}

// Stats ------------------------------------------------------------------------

export interface ContainerStatsResponse {
  id: string
  name: string
  os_type: string

  read: string
  preread?: string

  cpu_stats: CpuStats
  precpu_stats: CpuStats

  memory_stats: MemoryStats

  networks?: Record<string, NetworkStats>

  pids_stats: {
    current?: number
    limit?: number
  }

  blkio_stats: BlkioStats

  num_procs?: number

  storage_stats?: Record<string, number | undefined>
}

export interface CpuStats {
  cpu_usage: {
    total_usage: number
    usage_in_kernelmode: number
    usage_in_usermode: number
    percpu_usage?: number[]
  }
  cpu_percent?: number
  system_cpu_usage?: number
  online_cpus?: number
  throttling_data?: {
    periods?: number
    throttled_periods?: number
    throttled_time?: number
  }
}

export interface MemoryStats {
  usage: number
  limit: number
  memory_percent?: number
  stats?: {
    active_anon?: number
    active_file?: number
    anon?: number
    anon_thp?: number
    file?: number
    file_dirty?: number
    file_mapped?: number
    file_writeback?: number
    inactive_anon?: number
    inactive_file?: number
    kernel_stack?: number
    pgactivate?: number
    pgdeactivate?: number
    pgfault?: number
    pglazyfree?: number
    pglazyfreed?: number
    pgmajfault?: number
    pgrefill?: number
    pgscan?: number
    pgsteal?: number
    shmem?: number
    slab?: number
    slab_reclaimable?: number
    slab_unreclaimable?: number
    sock?: number
    thp_collapse_alloc?: number
    thp_fault_alloc?: number
    unevictable?: number
    workingset_activate?: number
    workingset_nodereclaim?: number
    workingset_refault?: number

    // allow unknown future fields
    [key: string]: number | undefined
  }
}

export interface NetworkStats {
  rx_bytes: number
  rx_packets: number
  rx_errors: number
  rx_dropped: number

  tx_bytes: number
  tx_packets: number
  tx_errors: number
  tx_dropped: number
}

export interface BlkioStats {
  io_service_bytes_recursive?: BlkioEntry[] | null
  io_serviced_recursive?: BlkioEntry[] | null
  io_queue_recursive?: BlkioEntry[] | null
  io_service_time_recursive?: BlkioEntry[] | null
  io_wait_time_recursive?: BlkioEntry[] | null
  io_merged_recursive?: BlkioEntry[] | null
  io_time_recursive?: BlkioEntry[] | null
  sectors_recursive?: BlkioEntry[] | null
}

export interface BlkioEntry {
  major: number
  minor: number
  op: string
  value: number
}

// System Descriptor ------------------------------------------------------------

export interface SystemDescriptor {
  Architecture: string
  Os: string
  Platform: string
}

export interface ParsedImageRef {
  // registry hostname (normalized)
  registry: string | null

  // full repository path (namespace/name)
  repository: string

  // tag or digest (e.g. "latest", "1.2.3", "sha256:abc123")
  reference: string

  // NEW: tag only (null if digest)
  tag: string | null

  // true if image has no registry and is local-only
  isLocal: boolean

  // original input string (for debugging / logging)
  original: string

  // true if reference is a digest (sha256:...)
  isDigest: boolean

  // true if reference is a tag (latest, v1, etc.)
  isTag: boolean

  // normalized registry (docker.io, ghcr.io, quay.io, lscr.io)
  normalizedRegistry: string

  // namespace (e.g. "library" for docker.io/ubuntu)
  namespace: string | null

  // image name (e.g. "ubuntu")
  image: string
}

export interface ImageManifest {
  schemaVersion: number
  mediaType: string

  config: {
    mediaType: string
    size: number
    digest: string
  }

  layers: Array<{
    mediaType: string
    size: number
    digest: string
    urls?: string[]
  }>
}
