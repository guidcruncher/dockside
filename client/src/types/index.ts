// ==========================================
// Strict Record and Capability Map Types
// ==========================================

export type Protocol = "tcp" | "udp" | "sctp"

export type SysctlsRecord = Record<string, string>

export type LabelsRecord = Record<string, string>

export type ExtraHostsRecord = Record<string, string>

export type DriverOptsRecord = Record<string, string | number>

export type StorageOptRecord = Record<string, string>

export type UlimitLimit = {
  soft?: number | string
  hard?: number | string
}

export type UlimitsRecord = Record<string, UlimitLimit>

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
export type RestartPolicy = "no" | "always" | "on-failure" | "unless-stopped"

export interface Service {
  name: string
  image?: string
  build?: string | ServiceBuild
  command?: string | string[]
  container_name?: string
  hostname?: string
  domainname?: string
  entrypoint?: string | string[]
  environment?: EnvironmentRecord | string[]
  env_file?: string | string[]
  ports?: (string | ServicePort)[]
  volumes?: (string | ServiceVolume)[]
  networks?: string[] | Record<string, ServiceNetwork | null>
  depends_on?: string[] | Record<string, ServiceDependency>
  restart?: RestartPolicy
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

export type ServicePortMode = "host" | "ingress"

export interface ServicePort {
  mode?: ServicePortMode
  host_ip?: string
  target?: number
  published?: string | number
  protocol?: Protocol
  description?: string
}

export type ServiceVolumeType = "bind" | "volume" | "tmpfs" | "npipe" | "cluster"
export type SeLinux = "z" | "Z"

export interface ServiceVolume {
  type: ServiceVolumeType
  source?: string
  target: string
  read_only?: boolean
  bind?: {
    propagation?: string
    create_host_path?: boolean
    selinux?: SeLinux
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

export type ServiceDependencyCondition =
  "service_started" | "service_healthy" | "service_completed_successfully"

export interface ServiceDependency {
  condition: ServiceDependencyCondition
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

export type ServiceDeployModel = "replicated" | "global"

export interface ServiceDeploy {
  mode?: ServiceDeployModel
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

export type FailureAction = "continue" | "pause" | "rollback"
export type DeployOrder = "start-first" | "stop-first"

export interface DeployUpdateConfig {
  parallelism?: number
  delay?: string
  failure_action?: FailureAction
  monitor?: string
  max_failure_ratio?: number
  order?: DeployOrder
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

export type DeployRestartPolicyCondition = "none" | "on-failure" | "any"

export interface DeployRestartPolicy {
  condition?: DeployRestartPolicyCondition
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

export type LinuxCapabilityDescriptions = Record<LinuxCapability, string>

export const LinuxCapabilityDescription: LinuxCapabilityDescriptions = {
  AUDIT_CONTROL: "Enable and control kernel auditing subsystem settings",
  AUDIT_READ: "Read access to the kernel auditing log",
  AUDIT_WRITE: "Write records to the kernel auditing log",
  BLOCK_SUSPEND: "Prevent system from entering suspend/hibernate",
  CHOWN: "Change file ownership (uid/gid) on arbitrary files",
  DAC_OVERRIDE: "Bypass file read/write/execute permission checks",
  DAC_READ_SEARCH: "Bypass file read permission checks and directory search checks",
  FOWNER: "Bypass file owner checks for operations like chmod/chown",
  FSETID: "Don't clear setuid/setgid bits when modifying files",
  IPC_LOCK: "Lock memory segments (mlock/munlock)",
  IPC_OWNER: "Bypass IPC ownership checks",
  KILL: "Send signals to any process",
  LEASE: "Establish file leases on arbitrary files",
  LINUX_IMMUTABLE: "Set or clear the immutable flag on files",
  MAC_ADMIN: "Configure Mandatory Access Control (MAC) policies",
  MAC_OVERRIDE: "Bypass MAC policy restrictions",
  MKNOD: "Create special files using mknod",
  NET_ADMIN: "Perform network administration tasks (interfaces, routing, firewall)",
  NET_BIND_SERVICE: "Bind to privileged ports (<1024)",
  NET_BROADCAST: "Use broadcast and multicast sockets",
  NET_RAW: "Use raw sockets and packet sockets",
  SETGID: "Set group ID for processes",
  SETFCAP: "Set file capabilities",
  SETPCAP: "Modify process capabilities",
  SETUID: "Set user ID for processes",
  SYS_ADMIN: "Perform a wide range of system administration operations",
  SYS_BOOT: "Trigger system reboot",
  SYS_CHROOT: "Use chroot to change root directory",
  SYS_MODULE: "Load and unload kernel modules",
  SYS_NICE: "Raise process priority and set scheduling policies",
  SYS_PACCT: "Configure process accounting",
  SYS_PTRACE: "Trace arbitrary processes (debugging)",
  SYS_RAWIO: "Perform raw I/O port operations",
  SYS_RESOURCE: "Override resource limits (rlimits)",
  SYS_TIME: "Set system clock",
  SYS_TTY_CONFIG: "Configure TTY devices",
  SYSLOG: "Read and clear kernel message buffer",
  WAKE_ALARM: "Trigger system wakeup alarms",
}

export type LinuxCapabilityGroupId =
  "filesystem" | "process" | "network" | "security" | "system" | "power"

export interface LinuxCapabilityGroup {
  id: LinuxCapabilityGroupId
  label: string
  capabilities: LinuxCapability[]
}

export const LinuxCapabilityGroups: LinuxCapabilityGroup[] = [
  {
    id: "filesystem",
    label: "Filesystem & IPC",
    capabilities: [
      "CHOWN",
      "DAC_OVERRIDE",
      "DAC_READ_SEARCH",
      "FOWNER",
      "FSETID",
      "LINUX_IMMUTABLE",
      "MKNOD",
      "IPC_LOCK",
      "IPC_OWNER",
      "LEASE",
    ],
  },
  {
    id: "process",
    label: "Process & Scheduling",
    capabilities: [
      "SETUID",
      "SETGID",
      "SETPCAP",
      "SETFCAP",
      "SYS_NICE",
      "SYS_PACCT",
      "SYS_PTRACE",
      "SYS_RESOURCE",
      "KILL",
    ],
  },
  {
    id: "network",
    label: "Networking",
    capabilities: ["NET_ADMIN", "NET_BIND_SERVICE", "NET_BROADCAST", "NET_RAW"],
  },
  {
    id: "security",
    label: "Security & MAC",
    capabilities: [
      "MAC_ADMIN",
      "MAC_OVERRIDE",
      "AUDIT_CONTROL",
      "AUDIT_READ",
      "AUDIT_WRITE",
      "SYSLOG",
    ],
  },
  {
    id: "system",
    label: "System & Kernel",
    capabilities: [
      "SYS_ADMIN",
      "SYS_BOOT",
      "SYS_CHROOT",
      "SYS_MODULE",
      "SYS_RAWIO",
      "SYS_TIME",
      "SYS_TTY_CONFIG",
    ],
  },
  {
    id: "power",
    label: "Power & Wake",
    capabilities: ["BLOCK_SUSPEND", "WAKE_ALARM"],
  },
]
