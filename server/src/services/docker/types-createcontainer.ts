// ==========================================
// Auxiliary Support Sub-Interfaces
// ==========================================

export interface HealthConfig {
  Test?: string[]
  Interval?: number
  Timeout?: number
  Retries?: number
  StartPeriod?: number
  StartInterval?: number
}

export interface PortBinding {
  HostIp?: string
  HostPort?: string
}

export interface RestartPolicy {
  Name?: "" | "no" | "always" | "on-failure" | "unless-stopped"
  MaximumRetryCount?: number
}

export interface MountConfig {
  Type?: "bind" | "volume" | "tmpfs" | "npipe" | "cluster"
  Source?: string
  Target?: string
  ReadOnly?: boolean
  Consistency?: "default" | "consistent" | "cached" | "delegated"
  BindOptions?: {
    Propagation?: "private" | "shared" | "slave" | "rprivate" | "rshared" | "rslave"
    NonRecursive?: boolean
    CreateHostPath?: boolean
  }
  VolumeOptions?: {
    NoCopy?: boolean
    Labels?: Record<string, string | undefined>
    DriverConfig?: {
      Name?: string
      Options?: Record<string, string | undefined>
    }
    Subpath?: string
  }
  TmpfsOptions?: {
    SizeBytes?: number
    Mode?: number
  }
}

export interface DeviceMapping {
  PathOnHost?: string
  PathInContainer?: string
  CgroupPermissions?: string
}

export interface DeviceRequest {
  Driver?: string
  Count?: number
  DeviceIDs?: string[]
  Capabilities?: string[][]
  Options?: Record<string, string | undefined>
}

export interface Ulimit {
  Name?: string
  Soft?: number
  Hard?: number
}

export interface LogConfig {
  Type?: string
  Config?: Record<string, string | undefined>
}

// ==========================================
// Resource Management Constraints
// ==========================================

export interface ContainerResources {
  CpuShares?: number
  Memory?: number
  CgroupParent?: string
  BlkioWeight?: number
  BlkioWeightDevice?: any[]
  BlkioDeviceReadBps?: any[]
  BlkioDeviceWriteBps?: any[]
  BlkioDeviceReadIOps?: any[]
  BlkioDeviceWriteIOps?: any[]
  CpuPeriod?: number
  CpuQuota?: number
  CpuRealtimePeriod?: number
  CpuRealtimeRuntime?: number
  CpusetCpus?: string
  CpusetMems?: string
  Devices?: DeviceMapping[]
  DeviceCgroupRules?: string[]
  DeviceRequests?: DeviceRequest[]
  MemoryReservation?: number
  MemorySwap?: number
  MemorySwappiness?: number
  OomKillDisable?: boolean
  PidsLimit?: number
  Ulimits?: Ulimit[]
  CpuCount?: number
  CpuPercent?: number
  IOMaximumIOps?: number
  IOMaximumBandwidth?: number
}

// ==========================================
// Main Host Configuration Layout
// ==========================================

export interface HostConfig extends ContainerResources {
  Binds?: string[]
  ContainerIDFile?: string
  LogConfig?: LogConfig
  NetworkMode?: string
  PortBindings?: Record<string, PortBinding[] | null | undefined>
  RestartPolicy?: RestartPolicy
  AutoRemove?: boolean
  VolumeDriver?: string
  VolumesFrom?: string[]
  Mounts?: MountConfig[]
  ConsoleSize?: number[]
  Annotations?: Record<string, string | undefined>
  CapAdd?: string[]
  CapDrop?: string[]
  CgroupnsMode?: "private" | "host"
  Dns?: string[]
  DnsOptions?: string[]
  DnsSearch?: string[]
  ExtraHosts?: string[]
  GroupAdd?: string[]
  IpcMode?: string
  Isolation?: "default" | "process" | "hyperv"
  Links?: string[]
  OomScoreAdj?: number
  PidMode?: string
  Privileged?: boolean
  PublishAllPorts?: boolean
  ReadonlyRootfs?: boolean
  SecurityOpt?: string[]
  StorageOpt?: Record<string, string | undefined>
  Tmpfs?: Record<string, string | undefined>
  UTSMode?: string
  UsernsMode?: string
  ShmSize?: number
  Runtime?: string
}

// ==========================================
// Networking Settings Per-Endpoint
// ==========================================

export interface EndpointSettings {
  IPAMConfig?: {
    IPv4Address?: string
    IPv6Address?: string
    LinkLocalIPs?: string[]
  }
  Links?: string[]
  MacAddress?: string
  Aliases?: string[]
  NetworkID?: string
  EndpointID?: string
  Gateway?: string
  IPAddress?: string
  IPPrefixLen?: number
  IPv6Gateway?: string
  GlobalIPv6Address?: string
  GlobalIPv6PrefixLen?: number
  DriverOpts?: Record<string, string | undefined>
  DNSNames?: string[]
}

export interface NetworkingConfig {
  EndpointsConfig?: Record<string, EndpointSettings | undefined>
}

// ==========================================
// Top-Level Container Create API Payload
// ==========================================

export interface ContainerCreateRequest {
  Hostname?: string
  Domainname?: string
  User?: string
  AttachStdin?: boolean
  AttachStdout?: boolean
  AttachStderr?: boolean
  ExposedPorts?: Record<string, Record<string, never> | undefined>
  Tty?: boolean
  OpenStdin?: boolean
  StdinOnce?: boolean
  Env?: string[]
  Cmd?: string[]
  Healthcheck?: HealthConfig
  ArgsEscaped?: boolean
  Image?: string
  Volumes?: Record<string, Record<string, never> | undefined>
  WorkingDir?: string
  Entrypoint?: string[]
  NetworkDisabled?: boolean
  OnBuild?: string[]
  Labels?: Record<string, string | undefined>
  StopSignal?: string
  StopGracePeriod?: number
  HostConfig?: HostConfig
  NetworkingConfig?: NetworkingConfig
}
