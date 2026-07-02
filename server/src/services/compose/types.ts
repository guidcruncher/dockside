// ==========================================
// Strict Record and Capability Map Types
// ==========================================

export type SysctlsRecord = Record<string, string>

export type LabelsRecord = Record<string, string>

export type ExtraHostsRecord = Record<string, string>

export type DriverOptsRecord = Record<string, string | number>

export type StorageOptRecord = Record<string, string>

export interface UlimitLimit {
  soft: number
  hard: number
}
export type UlimitsRecord = Record<string, number | UlimitLimit>

export type EnvironmentRecord = Record<string, string | number | boolean | null>

export type LinuxCapability =
  | "AUDIT_CONTROL"
  | "AUDIT_READ"
  | "AUDIT_WRITE"
  | "BLOCK_SUSPEND"
  | "CHOWN"
  | "DAC_OVERRIDE"
  | "DAC_READ_SEARCH"
  | "FOWNER"
  | "FSETID"
  | "IPC_LOCK"
  | "IPC_OWNER"
  | "KILL"
  | "LEASE"
  | "LINUX_IMMUTABLE"
  | "MAC_ADMIN"
  | "MAC_OVERRIDE"
  | "MKNOD"
  | "NET_ADMIN"
  | "NET_BIND_SERVICE"
  | "NET_BROADCAST"
  | "NET_RAW"
  | "SETGID"
  | "SETFCAP"
  | "SETPCAP"
  | "SETUID"
  | "SYS_ADMIN"
  | "SYS_BOOT"
  | "SYS_CHROOT"
  | "SYS_MODULE"
  | "SYS_NICE"
  | "SYS_PACCT"
  | "SYS_PTRACE"
  | "SYS_RAWIO"
  | "SYS_RESOURCE"
  | "SYS_TIME"
  | "SYS_TTY_CONFIG"
  | "SYSLOG"
  | "WAKE_ALARM"

export type ServiceCapabilitiesRecord = Record<LinuxCapability, boolean>

// ==========================================
// Top-Level Compose Configuration
// ==========================================

export interface ComposeConfig {
  name?: string
  version?: string
  services?: Record<string, Service>
  networks?: Record<string, Network | null>
  volumes?: Record<string, Volume | null>
  secrets?: Record<string, Secret>
  configs?: Record<string, Config>
}

// ==========================================
// Service Configuration
// ==========================================

export interface Service {
  image: string
  build?: string | ServiceBuild
  command?: string | string[]
  container_name?: string
  entrypoint?: string | string[]
  environment?: EnvironmentRecord | string[]
  env_file?: string | string[]
  ports?: (string | ServicePort)[]
  volumes?: (string | ServiceVolume)[]
  networks?: string[] | Record<string, ServiceNetwork | null>
  depends_on?: string[] | Record<string, ServiceDependency>
  restart?: "no" | "always" | "on-failure" | "unless-stopped"
  deploy?: ServiceDeploy
  logging?: ServiceLogging
  dns?: string | string[]
  dns_search?: string | string[]
  cap_add?: LinuxCapability[]
  cap_drop?: LinuxCapability[]
  cgroup_parent?: string
  devices?: string[]
  env_prefix?: string
  expose?: (string | number)[]
  extends?: string | ServiceExtends
  extra_hosts?: ExtraHostsRecord | string[]
  healthcheck?: ServiceHealthcheck
  init?: boolean
  ipc?: string
  isolation?: string
  labels?: LabelsRecord | string[]
  links?: string[]
  mac_address?: string
  network_mode?: string
  pid?: string | null
  privileged?: boolean
  profiles?: string[]
  read_only?: boolean
  secrets?: (string | ServiceSecretOrConfig)[]
  configs?: (string | ServiceSecretOrConfig)[]
  shm_size?: string | number
  stdin_open?: boolean
  stop_grace_period?: string
  stop_signal?: string
  sysctls?: SysctlsRecord | string[]
  storage_opt?: StorageOptRecord
  ulimits?: UlimitsRecord
  tmpfs?: string | string[]
  tty?: boolean
  user?: string
  working_dir?: string
}

export interface ServiceBuild {
  context?: string
  dockerfile?: string
  dockerfile_inline?: string
  args?: EnvironmentRecord | string[]
  cache_from?: string[]
  cache_to?: string[]
  labels?: LabelsRecord | string[]
  network?: string
  shm_size?: string | number
  target?: string
  secrets?: (string | ServiceSecretOrConfig)[]
  platforms?: string[]
}

export interface ServicePort {
  mode?: "host" | "ingress"
  host_ip?: string
  target?: number
  published?: string | number
  protocol?: "tcp" | "udp" | "sctp"
}

export interface ServiceVolume {
  type: "bind" | "volume" | "tmpfs" | "npipe" | "cluster"
  source?: string
  target: string
  read_only?: boolean
  bind?: {
    propagation?: string
    create_host_path?: boolean
    selinux?: "z" | "Z"
  }
  volume?: {
    nocopy?: boolean
  }
  tmpfs?: {
    size?: string | number
    mode?: number
  }
}

export interface ServiceNetwork {
  aliases?: string[]
  ipv4_address?: string
  ipv6_address?: string
  link_local_ips?: string[]
  priority?: number
}

export interface ServiceDependency {
  condition: "service_started" | "service_healthy" | "service_completed_successfully"
  restart?: boolean
  required?: boolean
}

export interface ServiceExtends {
  file?: string
  service: string
}

export interface ServiceHealthcheck {
  disable?: boolean
  test?: string | string[]
  interval?: string
  timeout?: string
  retries?: number
  start_period?: string
  start_interval?: string
}

export interface ServiceSecretOrConfig {
  source: string
  target?: string
  uid?: string
  gid?: string
  mode?: number
}

// ==========================================
// Deploy Configuration
// ==========================================

export interface ServiceDeploy {
  mode?: "replicated" | "global"
  replicas?: number
  labels?: LabelsRecord | string[]
  update_config?: DeployUpdateConfig
  rollback_config?: DeployUpdateConfig
  resources?: DeployResources
  restart_policy?: DeployRestartPolicy
  placement?: {
    constraints?: string[]
    preferences?: { spread?: string }[]
    max_replicas_per_node?: number
  }
}

export interface DeployUpdateConfig {
  parallelism?: number
  delay?: string
  failure_action?: "continue" | "pause" | "rollback"
  monitor?: string
  max_failure_ratio?: number
  order?: "start-first" | "stop-first"
}

export interface DeployResources {
  limits?: ResourceLimits
  reservations?: ResourceLimits
}

export interface ResourceLimits {
  cpus?: string | number
  memory?: string
  pids?: number
  devices?: DeviceResource[]
}

export interface DeviceResource {
  capabilities?: string[]
  count?: string | number
  device_ids?: string[]
  driver?: string
}

export interface DeployRestartPolicy {
  condition?: "none" | "on-failure" | "any"
  delay?: string
  max_attempts?: number
  window?: string
}

export interface ServiceLogging {
  driver?: string
  options?: Record<string, string | number | null>
}

// ==========================================
// Networks, Volumes, Secrets, and Configs
// ==========================================

export interface Network {
  name?: string
  driver?: string
  driver_opts?: DriverOptsRecord
  ipam?: {
    driver?: string
    config?: { subnet?: string; gateway?: string; ip_range?: string }[]
    options?: Record<string, string>
  }
  external?: boolean | { name?: string }
  internal?: boolean
  enable_ipv6?: boolean
  attachable?: boolean
  labels?: LabelsRecord | string[]
}

export interface Volume {
  name?: string
  driver?: string
  driver_opts?: DriverOptsRecord
  external?: boolean | { name?: string }
  labels?: LabelsRecord | string[]
}

export interface Secret {
  name?: string
  file?: string
  environment?: string
  external?: boolean | { name?: string }
  labels?: LabelsRecord | string[]
}

export interface Config {
  name?: string
  file?: string
  environment?: string
  external?: boolean | { name?: string }
  labels?: LabelsRecord | string[]
}
