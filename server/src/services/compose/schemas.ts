import { Type, type Static } from "@sinclair/typebox"

// ==========================================
// Strict Record and Capability Map Types
// ==========================================

export const SysctlsRecordSchema = Type.Record(Type.String(), Type.String())

export const LabelsRecordSchema = Type.Record(Type.String(), Type.String())

export const ExtraHostsRecordSchema = Type.Record(Type.String(), Type.String())

export const DriverOptsRecordSchema = Type.Record(
  Type.String(),
  Type.Union([Type.String(), Type.Number()]),
)

export const StorageOptRecordSchema = Type.Record(Type.String(), Type.String())

export const UlimitLimitSchema = Type.Object({
  soft: Type.Number(),
  hard: Type.Number(),
})

export const UlimitsRecordSchema = Type.Record(
  Type.String(),
  Type.Union([Type.Number(), UlimitLimitSchema]),
)

export const EnvironmentRecordSchema = Type.Record(
  Type.String(),
  Type.Union([Type.String(), Type.Number(), Type.Boolean(), Type.Null()]),
)

export const LinuxCapabilitySchema = Type.Union([
  Type.Literal("AUDIT_CONTROL"),
  Type.Literal("AUDIT_READ"),
  Type.Literal("AUDIT_WRITE"),
  Type.Literal("BLOCK_SUSPEND"),
  Type.Literal("CHOWN"),
  Type.Literal("DAC_OVERRIDE"),
  Type.Literal("DAC_READ_SEARCH"),
  Type.Literal("FOWNER"),
  Type.Literal("FSETID"),
  Type.Literal("IPC_LOCK"),
  Type.Literal("IPC_OWNER"),
  Type.Literal("KILL"),
  Type.Literal("LEASE"),
  Type.Literal("LINUX_IMMUTABLE"),
  Type.Literal("MAC_ADMIN"),
  Type.Literal("MAC_OVERRIDE"),
  Type.Literal("MKNOD"),
  Type.Literal("NET_ADMIN"),
  Type.Literal("NET_BIND_SERVICE"),
  Type.Literal("NET_BROADCAST"),
  Type.Literal("NET_RAW"),
  Type.Literal("SETGID"),
  Type.Literal("SETFCAP"),
  Type.Literal("SETPCAP"),
  Type.Literal("SETUID"),
  Type.Literal("SYS_ADMIN"),
  Type.Literal("SYS_BOOT"),
  Type.Literal("SYS_CHROOT"),
  Type.Literal("SYS_MODULE"),
  Type.Literal("SYS_NICE"),
  Type.Literal("SYS_PACCT"),
  Type.Literal("SYS_PTRACE"),
  Type.Literal("SYS_RAWIO"),
  Type.Literal("SYS_RESOURCE"),
  Type.Literal("SYS_TIME"),
  Type.Literal("SYS_TTY_CONFIG"),
  Type.Literal("SYSLOG"),
  Type.Literal("WAKE_ALARM"),
])

export const ServiceCapabilitiesRecordSchema = Type.Record(LinuxCapabilitySchema, Type.Boolean())

// ==========================================
// Sub-Schemas and Supporting Definitions
// ==========================================

export const ServiceSecretOrConfigSchema = Type.Object({
  source: Type.String(),
  target: Type.Optional(Type.String()),
  uid: Type.Optional(Type.String()),
  gid: Type.Optional(Type.String()),
  mode: Type.Optional(Type.Number()),
})

export const ServiceBuildSchema = Type.Object({
  context: Type.Optional(Type.String()),
  dockerfile: Type.Optional(Type.String()),
  dockerfile_inline: Type.Optional(Type.String()),
  args: Type.Optional(Type.Union([EnvironmentRecordSchema, Type.Array(Type.String())])),
  cache_from: Type.Optional(Type.Array(Type.String())),
  cache_to: Type.Optional(Type.Array(Type.String())),
  labels: Type.Optional(Type.Union([LabelsRecordSchema, Type.Array(Type.String())])),
  network: Type.Optional(Type.String()),
  shm_size: Type.Optional(Type.Union([Type.String(), Type.Number()])),
  target: Type.Optional(Type.String()),
  secrets: Type.Optional(Type.Array(Type.Union([Type.String(), ServiceSecretOrConfigSchema]))),
  platforms: Type.Optional(Type.Array(Type.String())),
})

export const ServicePortSchema = Type.Object({
  mode: Type.Optional(Type.Union([Type.Literal("host"), Type.Literal("ingress")])),
  host_ip: Type.Optional(Type.String()),
  target: Type.Optional(Type.Number()),
  published: Type.Optional(Type.Union([Type.String(), Type.Number()])),
  protocol: Type.Optional(
    Type.Union([Type.Literal("tcp"), Type.Literal("udp"), Type.Literal("sctp")]),
  ),
})

export const ServiceVolumeSchema = Type.Object({
  type: Type.Union([
    Type.Literal("bind"),
    Type.Literal("volume"),
    Type.Literal("tmpfs"),
    Type.Literal("npipe"),
    Type.Literal("cluster"),
  ]),
  source: Type.Optional(Type.String()),
  target: Type.String(),
  read_only: Type.Optional(Type.Boolean()),
  bind: Type.Optional(
    Type.Object({
      propagation: Type.Optional(Type.String()),
      create_host_path: Type.Optional(Type.Boolean()),
      selinux: Type.Optional(Type.Union([Type.Literal("z"), Type.Literal("Z")])),
    }),
  ),
  volume: Type.Optional(
    Type.Object({
      nocopy: Type.Optional(Type.Boolean()),
    }),
  ),
  tmpfs: Type.Optional(
    Type.Object({
      size: Type.Optional(Type.Union([Type.String(), Type.Number()])),
      mode: Type.Optional(Type.Number()),
    }),
  ),
})

export const ServiceNetworkSchema = Type.Object({
  aliases: Type.Optional(Type.Array(Type.String())),
  ipv4_address: Type.Optional(Type.String()),
  ipv6_address: Type.Optional(Type.String()),
  link_local_ips: Type.Optional(Type.Array(Type.String())),
  priority: Type.Optional(Type.Number()),
})

export const ServiceDependencySchema = Type.Object({
  condition: Type.Union([
    Type.Literal("service_started"),
    Type.Literal("service_healthy"),
    Type.Literal("service_completed_successfully"),
  ]),
  restart: Type.Optional(Type.Boolean()),
  required: Type.Optional(Type.Boolean()),
})

export const ServiceExtendsSchema = Type.Object({
  file: Type.Optional(Type.String()),
  service: Type.String(),
})

export const ServiceHealthcheckSchema = Type.Object({
  disable: Type.Optional(Type.Boolean()),
  test: Type.Optional(Type.Union([Type.String(), Type.Array(Type.String())])),
  interval: Type.Optional(Type.String()),
  timeout: Type.Optional(Type.String()),
  retries: Type.Optional(Type.Number()),
  start_period: Type.Optional(Type.String()),
  start_interval: Type.Optional(Type.String()),
})

export const DeployUpdateConfigSchema = Type.Object({
  parallelism: Type.Optional(Type.Number()),
  delay: Type.Optional(Type.String()),
  failure_action: Type.Optional(
    Type.Union([Type.Literal("continue"), Type.Literal("pause"), Type.Literal("rollback")]),
  ),
  monitor: Type.Optional(Type.String()),
  max_failure_ratio: Type.Optional(Type.Number()),
  order: Type.Optional(Type.Union([Type.Literal("start-first"), Type.Literal("stop-first")])),
})

export const DeviceResourceSchema = Type.Object({
  capabilities: Type.Optional(Type.Array(Type.String())),
  count: Type.Optional(Type.Union([Type.String(), Type.Number()])),
  device_ids: Type.Optional(Type.Array(Type.String())),
  driver: Type.Optional(Type.String()),
})

export const ResourceLimitsSchema = Type.Object({
  cpus: Type.Optional(Type.Union([Type.String(), Type.Number()])),
  memory: Type.Optional(Type.String()),
  pids: Type.Optional(Type.Number()),
  devices: Type.Optional(Type.Array(DeviceResourceSchema)),
})

export const DeployResourcesSchema = Type.Object({
  limits: Type.Optional(ResourceLimitsSchema),
  reservations: Type.Optional(ResourceLimitsSchema),
})

export const DeployRestartPolicySchema = Type.Object({
  condition: Type.Optional(
    Type.Union([Type.Literal("none"), Type.Literal("on-failure"), Type.Literal("any")]),
  ),
  delay: Type.Optional(Type.String()),
  max_attempts: Type.Optional(Type.Number()),
  window: Type.Optional(Type.String()),
})

export const ServiceDeploySchema = Type.Object({
  mode: Type.Optional(Type.Union([Type.Literal("replicated"), Type.Literal("global")])),
  replicas: Type.Optional(Type.Number()),
  labels: Type.Optional(Type.Union([LabelsRecordSchema, Type.Array(Type.String())])),
  update_config: Type.Optional(DeployUpdateConfigSchema),
  rollback_config: Type.Optional(DeployUpdateConfigSchema),
  resources: Type.Optional(DeployResourcesSchema),
  restart_policy: Type.Optional(DeployRestartPolicySchema),
  placement: Type.Optional(
    Type.Object({
      constraints: Type.Optional(Type.Array(Type.String())),
      preferences: Type.Optional(Type.Array(Type.Object({ spread: Type.Optional(Type.String()) }))),
      max_replicas_per_node: Type.Optional(Type.Number()),
    }),
  ),
})

export const ServiceLoggingSchema = Type.Object({
  driver: Type.Optional(Type.String()),
  options: Type.Optional(
    Type.Record(Type.String(), Type.Union([Type.String(), Type.Number(), Type.Null()])),
  ),
})

// ==========================================
// Main Service Schema
// ==========================================

export const ServiceSchema = Type.Object({
  image: Type.Optional(Type.String()),
  build: Type.Optional(Type.Union([Type.String(), ServiceBuildSchema])),
  command: Type.Optional(Type.Union([Type.String(), Type.Array(Type.String())])),
  container_name: Type.Optional(Type.String()),
  entrypoint: Type.Optional(Type.Union([Type.String(), Type.Array(Type.String())])),
  environment: Type.Optional(Type.Union([EnvironmentRecordSchema, Type.Array(Type.String())])),
  env_file: Type.Optional(Type.Union([Type.String(), Type.Array(Type.String())])),
  ports: Type.Optional(Type.Array(Type.Union([Type.String(), ServicePortSchema]))),
  volumes: Type.Optional(Type.Array(Type.Union([Type.String(), ServiceVolumeSchema]))),
  networks: Type.Optional(
    Type.Union([
      Type.Array(Type.String()),
      Type.Record(Type.String(), Type.Union([ServiceNetworkSchema, Type.Null()])),
    ]),
  ),
  depends_on: Type.Optional(
    Type.Union([Type.Array(Type.String()), Type.Record(Type.String(), ServiceDependencySchema)]),
  ),
  restart: Type.Optional(
    Type.Union([
      Type.Literal("no"),
      Type.Literal("always"),
      Type.Literal("on-failure"),
      Type.Literal("unless-stopped"),
    ]),
  ),
  deploy: Type.Optional(ServiceDeploySchema),
  logging: Type.Optional(ServiceLoggingSchema),
  dns: Type.Optional(Type.Union([Type.String(), Type.Array(Type.String())])),
  dns_search: Type.Optional(Type.Union([Type.String(), Type.Array(Type.String())])),
  cap_add: Type.Optional(Type.Array(LinuxCapabilitySchema)),
  cap_drop: Type.Optional(Type.Array(LinuxCapabilitySchema)),
  cgroup_parent: Type.Optional(Type.String()),
  devices: Type.Optional(Type.Array(Type.String())),
  env_prefix: Type.Optional(Type.String()),
  expose: Type.Optional(Type.Array(Type.Union([Type.String(), Type.Number()]))),
  extends: Type.Optional(Type.Union([Type.String(), ServiceExtendsSchema])),
  extra_hosts: Type.Optional(Type.Union([ExtraHostsRecordSchema, Type.Array(Type.String())])),
  healthcheck: Type.Optional(ServiceHealthcheckSchema),
  init: Type.Optional(Type.Boolean()),
  ipc: Type.Optional(Type.String()),
  isolation: Type.Optional(Type.String()),
  labels: Type.Optional(Type.Union([LabelsRecordSchema, Type.Array(Type.String())])),
  links: Type.Optional(Type.Array(Type.String())),
  mac_address: Type.Optional(Type.String()),
  network_mode: Type.Optional(Type.String()),
  pid: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  privileged: Type.Optional(Type.Boolean()),
  profiles: Type.Optional(Type.Array(Type.String())),
  read_only: Type.Optional(Type.Boolean()),
  secrets: Type.Optional(Type.Array(Type.Union([Type.String(), ServiceSecretOrConfigSchema]))),
  configs: Type.Optional(Type.Array(Type.Union([Type.String(), ServiceSecretOrConfigSchema]))),
  shm_size: Type.Optional(Type.Union([Type.String(), Type.Number()])),
  stdin_open: Type.Optional(Type.Boolean()),
  stop_grace_period: Type.Optional(Type.String()),
  stop_signal: Type.Optional(Type.String()),
  sysctls: Type.Optional(Type.Union([SysctlsRecordSchema, Type.Array(Type.String())])),
  storage_opt: Type.Optional(StorageOptRecordSchema),
  ulimits: Type.Optional(UlimitsRecordSchema),
  tmpfs: Type.Optional(Type.Union([Type.String(), Type.Array(Type.String())])),
  tty: Type.Optional(Type.Boolean()),
  user: Type.Optional(Type.String()),
  working_dir: Type.Optional(Type.String()),
})

// ==========================================
// Infrastructure Schema Groupings
// ==========================================

export const NetworkSchema = Type.Object({
  name: Type.Optional(Type.String()),
  driver: Type.Optional(Type.String()),
  driver_opts: Type.Optional(DriverOptsRecordSchema),
  ipam: Type.Optional(
    Type.Object({
      driver: Type.Optional(Type.String()),
      config: Type.Optional(
        Type.Array(
          Type.Object({
            subnet: Type.Optional(Type.String()),
            gateway: Type.Optional(Type.String()),
            ip_range: Type.Optional(Type.String()),
          }),
        ),
      ),
      options: Type.Optional(Type.Record(Type.String(), Type.String())),
    }),
  ),
  external: Type.Optional(
    Type.Union([Type.Boolean(), Type.Object({ name: Type.Optional(Type.String()) })]),
  ),
  internal: Type.Optional(Type.Boolean()),
  enable_ipv6: Type.Optional(Type.Boolean()),
  attachable: Type.Optional(Type.Boolean()),
  labels: Type.Optional(Type.Union([LabelsRecordSchema, Type.Array(Type.String())])),
})

export const VolumeSchema = Type.Object({
  name: Type.Optional(Type.String()),
  driver: Type.Optional(Type.String()),
  driver_opts: Type.Optional(DriverOptsRecordSchema),
  external: Type.Optional(
    Type.Union([Type.Boolean(), Type.Object({ name: Type.Optional(Type.String()) })]),
  ),
  labels: Type.Optional(Type.Union([LabelsRecordSchema, Type.Array(Type.String())])),
})

export const SecretSchema = Type.Object({
  name: Type.Optional(Type.String()),
  file: Type.Optional(Type.String()),
  environment: Type.Optional(Type.String()),
  external: Type.Optional(
    Type.Union([Type.Boolean(), Type.Object({ name: Type.Optional(Type.String()) })]),
  ),
  labels: Type.Optional(Type.Union([LabelsRecordSchema, Type.Array(Type.String())])),
})

export const ConfigSchema = Type.Object({
  name: Type.Optional(Type.String()),
  file: Type.Optional(Type.String()),
  environment: Type.Optional(Type.String()),
  external: Type.Optional(
    Type.Union([Type.Boolean(), Type.Object({ name: Type.Optional(Type.String()) })]),
  ),
  labels: Type.Optional(Type.Union([LabelsRecordSchema, Type.Array(Type.String())])),
})

// ==========================================
// Top-Level Compose Configuration Schema
// ==========================================

export const ComposeConfigSchema = Type.Object({
  name: Type.Optional(Type.String()),
  version: Type.Optional(Type.String()),
  services: Type.Optional(Type.Record(Type.String(), ServiceSchema)),
  networks: Type.Optional(Type.Record(Type.String(), Type.Union([NetworkSchema, Type.Null()]))),
  volumes: Type.Optional(Type.Record(Type.String(), Type.Union([VolumeSchema, Type.Null()]))),
  secrets: Type.Optional(Type.Record(Type.String(), SecretSchema)),
  configs: Type.Optional(Type.Record(Type.String(), ConfigSchema)),
})

// Type Inference Links
export type TComposeConfig = Static<typeof ComposeConfigSchema>
