import { Type } from "@sinclair/typebox"

// -----------------------------------------------------------------------------
// DockSide Types
// -----------------------------------------------------------------------------

export const ComposeLinkInfoSchema = Type.Object({
  dsId: Type.Optional(Type.String()),
  projectName: Type.String(),
  serviceName: Type.String(),
  workingDir: Type.String(),
  configFile: Type.String(),
})

// -----------------------------------------------------------------------------
// System Version
// -----------------------------------------------------------------------------

export const SystemVersionSchema = Type.Object({
  Version: Type.String(),
  ApiVersion: Type.String(),
  MinAPIVersion: Type.String(),
  GitCommit: Type.String(),
  GoVersion: Type.String(),
  Os: Type.String(),
  Arch: Type.String(),
  Variant: Type.Optional(Type.String()),
  KernelVersion: Type.String(),
  BuildTime: Type.String(),
  Platform: Type.Optional(
    Type.Object({
      Name: Type.String(),
    }),
  ),
  Components: Type.Optional(
    Type.Array(
      Type.Object({
        Name: Type.String(),
        Version: Type.String(),
        Details: Type.Optional(Type.Record(Type.String(), Type.String())),
      }),
    ),
  ),
})

// -----------------------------------------------------------------------------
// System Info
// -----------------------------------------------------------------------------

export const SystemInfoSchema = Type.Object({
  ID: Type.String(),
  Containers: Type.Number(),
  ContainersRunning: Type.Number(),
  ContainersPaused: Type.Number(),
  ContainersStopped: Type.Number(),
  Images: Type.Number(),
  Driver: Type.String(),
  DriverStatus: Type.Optional(Type.Array(Type.Tuple([Type.String(), Type.String()]))),
  Plugins: Type.Optional(
    Type.Object({
      Volume: Type.Optional(Type.Array(Type.String())),
      Network: Type.Optional(Type.Array(Type.String())),
      Authorization: Type.Optional(Type.Array(Type.String())),
      Log: Type.Optional(Type.Array(Type.String())),
    }),
  ),
  MemoryLimit: Type.Boolean(),
  SwapLimit: Type.Boolean(),
  KernelMemory: Type.Boolean(),
  CpuCfsPeriod: Type.Boolean(),
  CpuCfsQuota: Type.Boolean(),
  CPUShares: Type.Boolean(),
  CPUSet: Type.Boolean(),
  IPv4Forwarding: Type.Boolean(),
  BridgeNfIptables: Type.Boolean(),
  BridgeNfIp6tables: Type.Boolean(),
  Debug: Type.Boolean(),
  NFd: Type.Number(),
  OomKillDisable: Type.Boolean(),
  NGoroutines: Type.Number(),
  SystemTime: Type.String(),
  LoggingDriver: Type.String(),
  CgroupDriver: Type.String(),
  CgroupVersion: Type.Optional(Type.String()),
  KernelVersion: Type.String(),
  OperatingSystem: Type.String(),
  OSType: Type.String(),
  Architecture: Type.String(),
  NCPU: Type.Number(),
  MemTotal: Type.Number(),
  DockerRootDir: Type.String(),
  HttpProxy: Type.Optional(Type.String()),
  HttpsProxy: Type.Optional(Type.String()),
  NoProxy: Type.Optional(Type.String()),
  Name: Type.String(),
  ServerVersion: Type.String(),
  Runtimes: Type.Optional(
    Type.Record(
      Type.String(),
      Type.Object({
        path: Type.String(),
      }),
    ),
  ),
  DefaultRuntime: Type.Optional(Type.String()),
  Swarm: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
  LiveRestoreEnabled: Type.Optional(Type.Boolean()),
})

// -----------------------------------------------------------------------------
// Container Summary
// -----------------------------------------------------------------------------

export const ContainerSummaryResponseSchema = Type.Object({
  Id: Type.String(),
  Names: Type.Array(Type.String()),
  Image: Type.String(),
  ImageID: Type.String(),
  Command: Type.String(),
  Created: Type.Number(),
  State: Type.String(),
  Status: Type.String(),
  Ports: Type.Optional(
    Type.Array(
      Type.Object({
        PrivatePort: Type.Number(),
        PublicPort: Type.Optional(Type.Number()),
        Type: Type.String(),
        IP: Type.Optional(Type.String()),
      }),
    ),
  ),
  Labels: Type.Optional(Type.Record(Type.String(), Type.String())),
  SizeRw: Type.Optional(Type.Number()),
  SizeRootFs: Type.Optional(Type.Number()),
  HostConfig: Type.Optional(
    Type.Object({
      NetworkMode: Type.String(),
    }),
  ),
  NetworkSettings: Type.Optional(
    Type.Object({
      Networks: Type.Record(Type.String(), Type.Unknown()),
    }),
  ),
  Mounts: Type.Optional(
    Type.Array(
      Type.Object({
        Type: Type.String(),
        Name: Type.Optional(Type.String()),
        Source: Type.String(),
        Destination: Type.String(),
        Driver: Type.Optional(Type.String()),
        Mode: Type.String(),
        RW: Type.Boolean(),
        Propagation: Type.String(),
      }),
    ),
  ),
})

// -----------------------------------------------------------------------------
// Container Inspect
// -----------------------------------------------------------------------------

export const ContainerInspectResponseSchema = Type.Object({
  Id: Type.String(),
  Created: Type.String(),
  Path: Type.String(),
  Args: Type.Array(Type.String()),
  Name: Type.String(),
  RestartCount: Type.Number(),
  Driver: Type.String(),
  Platform: Type.Optional(Type.String()),
  State: Type.Object({
    Status: Type.String(),
    Running: Type.Boolean(),
    Paused: Type.Boolean(),
    Restarting: Type.Boolean(),
    OOMKilled: Type.Boolean(),
    Dead: Type.Boolean(),
    Pid: Type.Number(),
    ExitCode: Type.Number(),
    Error: Type.String(),
    StartedAt: Type.String(),
    FinishedAt: Type.String(),
  }),
  Image: Type.String(),
  ResolvConfPath: Type.String(),
  HostnamePath: Type.String(),
  HostsPath: Type.String(),
  LogPath: Type.String(),
  Node: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
  MountLabel: Type.Optional(Type.String()),
  ProcessLabel: Type.Optional(Type.String()),
  AppArmorProfile: Type.Optional(Type.String()),
  ExecIDs: Type.Optional(Type.Union([Type.Array(Type.String()), Type.Null()])),
  HostConfig: Type.Record(Type.String(), Type.Unknown()),
  GraphDriver: Type.Object({
    Name: Type.String(),
    Data: Type.Record(Type.String(), Type.String()),
  }),
  Mounts: Type.Array(
    Type.Object({
      Type: Type.String(),
      Name: Type.Optional(Type.String()),
      Source: Type.String(),
      Destination: Type.String(),
      Driver: Type.Optional(Type.String()),
      Mode: Type.String(),
      RW: Type.Boolean(),
      Propagation: Type.String(),
    }),
  ),
  Config: Type.Object({
    Hostname: Type.String(),
    Domainname: Type.String(),
    User: Type.String(),
    AttachStdin: Type.Boolean(),
    AttachStdout: Type.Boolean(),
    AttachStderr: Type.Boolean(),
    ExposedPorts: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
    Tty: Type.Boolean(),
    OpenStdin: Type.Boolean(),
    StdinOnce: Type.Boolean(),
    Env: Type.Array(Type.String()),
    Cmd: Type.Union([Type.Array(Type.String()), Type.Null()]),
    Image: Type.String(),
    Volumes: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
    WorkingDir: Type.String(),
    Entrypoint: Type.Optional(Type.Union([Type.Array(Type.String()), Type.Null()])),
    Labels: Type.Optional(Type.Record(Type.String(), Type.String())),
  }),
  NetworkSettings: Type.Record(Type.String(), Type.Unknown()),
})

// -----------------------------------------------------------------------------
// Container Create
// -----------------------------------------------------------------------------

export const ContainerCreateResponseSchema = Type.Object({
  Id: Type.String(),
  Warnings: Type.Optional(Type.Union([Type.Array(Type.String()), Type.Null()])),
})

// -----------------------------------------------------------------------------
// Image Summary
// -----------------------------------------------------------------------------

export const ImageSummarySchema = Type.Object({
  Id: Type.String(),
  ParentId: Type.String(),
  RepoTags: Type.Optional(Type.Union([Type.Array(Type.String()), Type.Null()])),
  RepoDigests: Type.Optional(Type.Union([Type.Array(Type.String()), Type.Null()])),
  Created: Type.Number(),
  Size: Type.Number(),
  SharedSize: Type.Number(),
  VirtualSize: Type.Optional(Type.Number()),
  Labels: Type.Optional(Type.Record(Type.String(), Type.String())),
  Containers: Type.Number(),
})

// -----------------------------------------------------------------------------
// Image Inspect
// -----------------------------------------------------------------------------

export const ImageInspectResponseSchema = Type.Object({
  Id: Type.String(),
  RepoTags: Type.Optional(Type.Union([Type.Array(Type.String()), Type.Null()])),
  RepoDigests: Type.Optional(Type.Union([Type.Array(Type.String()), Type.Null()])),
  Created: Type.String(),
  Size: Type.Number(),
  VirtualSize: Type.Optional(Type.Number()),
  Architecture: Type.String(),
  Os: Type.String(),
  OsVersion: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  Variant: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  Author: Type.Optional(Type.String()),
  Comment: Type.Optional(Type.String()),
  Config: Type.Optional(
    Type.Object({
      User: Type.Optional(Type.String()),
      Env: Type.Optional(Type.Array(Type.String())),
      Cmd: Type.Optional(Type.Array(Type.String())),
      Entrypoint: Type.Optional(Type.Array(Type.String())),
      WorkingDir: Type.Optional(Type.String()),
      Labels: Type.Optional(Type.Record(Type.String(), Type.String())),
    }),
  ),
  RootFS: Type.Optional(
    Type.Object({
      Type: Type.Optional(Type.String()),
      Layers: Type.Optional(Type.Array(Type.String())),
    }),
  ),
  GraphDriver: Type.Optional(
    Type.Object({
      Name: Type.String(),
      Data: Type.Record(Type.String(), Type.String()),
    }),
  ),
})

// -----------------------------------------------------------------------------
// Exec Create
// -----------------------------------------------------------------------------

export const ExecCreateResponseSchema = Type.Object({
  Id: Type.String(),
})

// -----------------------------------------------------------------------------
// Event Message
// -----------------------------------------------------------------------------

export const EventMessageSchema = Type.Object({
  Type: Type.String(),
  Action: Type.String(),
  Actor: Type.Object({
    ID: Type.String(),
    Attributes: Type.Record(Type.String(), Type.String()),
  }),
  time: Type.Number(),
  timeNano: Type.Number(),
  scope: Type.Optional(Type.String()),
})

// -----------------------------------------------------------------------------
// Container Stats
// -----------------------------------------------------------------------------

export const ContainerStatsResponseSchema = Type.Object({
  read: Type.String(),
  pids_stats: Type.Object({
    current: Type.Number(),
  }),
  cpu_stats: Type.Record(Type.String(), Type.Unknown()),
  precpu_stats: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
  memory_stats: Type.Record(Type.String(), Type.Unknown()),
  networks: Type.Record(Type.String(), Type.Unknown()),
})

// -----------------------------------------------------------------------------
// System Descriptor
// -----------------------------------------------------------------------------

export const SystemDescriptorSchema = Type.Object({
  Architecture: Type.String(),
  Os: Type.String(),
  Platform: Type.String(),
})
