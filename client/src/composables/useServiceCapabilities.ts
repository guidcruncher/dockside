// composables/useServiceCapabilities.ts
import { ref } from "vue"
import type { LinuxCapability, ServiceCapabilitiesRecord } from "@/types"

const ALL_CAPS: LinuxCapability[] = [
  "AUDIT_CONTROL",
  "AUDIT_READ",
  "AUDIT_WRITE",
  "BLOCK_SUSPEND",
  "CHOWN",
  "DAC_OVERRIDE",
  "DAC_READ_SEARCH",
  "FOWNER",
  "FSETID",
  "IPC_LOCK",
  "IPC_OWNER",
  "KILL",
  "LEASE",
  "LINUX_IMMUTABLE",
  "MAC_ADMIN",
  "MAC_OVERRIDE",
  "MKNOD",
  "NET_ADMIN",
  "NET_BIND_SERVICE",
  "NET_BROADCAST",
  "NET_RAW",
  "SETGID",
  "SETFCAP",
  "SETPCAP",
  "SETUID",
  "SYS_ADMIN",
  "SYS_BOOT",
  "SYS_CHROOT",
  "SYS_MODULE",
  "SYS_NICE",
  "SYS_PACCT",
  "SYS_PTRACE",
  "SYS_RAWIO",
  "SYS_RESOURCE",
  "SYS_TIME",
  "SYS_TTY_CONFIG",
  "SYSLOG",
  "WAKE_ALARM",
]

function createDefaultCaps(): ServiceCapabilitiesRecord {
  return Object.fromEntries(ALL_CAPS.map((c) => [c, false])) as ServiceCapabilitiesRecord
}

export function useServiceCapabilities(initial?: ServiceCapabilitiesRecord) {
  const caps = ref<ServiceCapabilitiesRecord>(initial ?? createDefaultCaps())

  function enable(cap: LinuxCapability) {
    caps.value[cap] = true
  }

  function disable(cap: LinuxCapability) {
    caps.value[cap] = false
  }

  return { caps, enable, disable }
}
