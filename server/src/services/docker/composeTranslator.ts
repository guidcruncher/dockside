// composeTranslator.ts
import type { Service } from "../compose/types.js"
import type { ContainerCreateRequest } from "./types-createcontainer.js"
import { DockSideId } from "./types.js"

export class ComposeTranslator {
  /**
   * Transforms a highly structured Compose Spec Service declaration into an
   * unrolled engine payload compatible with Docker's Container Create v1.54 API endpoints.
   */
  public static translate(dsId: string, service: Service): ContainerCreateRequest {
    const config: ContainerCreateRequest = {
      HostConfig: {},
      Labels: {},
    }

    if (service.image !== undefined) config.Image = service.image
    if (service.tty !== undefined) config.Tty = service.tty
    if (service.stdin_open !== undefined) config.OpenStdin = service.stdin_open
    if (service.user !== undefined) config.User = service.user
    if (service.working_dir !== undefined) config.WorkingDir = service.working_dir

    const hostConfig = config.HostConfig!

    // 1. Map Commands & Entrypoints
    if (service.command !== undefined) {
      config.Cmd =
        typeof service.command === "string" ? service.command.split(" ") : service.command
    }
    if (service.entrypoint !== undefined) {
      config.Entrypoint =
        typeof service.entrypoint === "string" ? service.entrypoint.split(" ") : service.entrypoint
    }

    // 2. Map Environment Variables
    if (service.environment !== undefined) {
      if (Array.isArray(service.environment)) {
        config.Env = service.environment
      } else {
        config.Env = Object.entries(service.environment)
          .filter(([, val]) => val !== null)
          .map(([key, val]) => `${key}=${String(val)}`)
      }
    }

    // 3. Map Labels safely (with fallback record instantiation)
    if (service.labels !== undefined) {
      if (Array.isArray(service.labels)) {
        const labelsObj: Record<string, string> = {}
        for (const label of service.labels) {
          const parts = label.split("=")
          const key = parts[0]
          if (key !== undefined) {
            labelsObj[key] = parts[1] ?? ""
          }
        }
        config.Labels = labelsObj
      } else {
        config.Labels = { ...service.labels }
      }
    }

    // Enforce internal platform tracking fields securely
    config.Labels![DockSideId] = dsId

    // 4. Map Security, Capabilities & Modes
    if (service.privileged !== undefined) {
      // Removed top-level config.Privileged assignment
      hostConfig.Privileged = service.privileged
    }
    if (service.read_only !== undefined) {
      // Removed top-level config.ReadonlyRootfs assignment
      hostConfig.ReadonlyRootfs = service.read_only
    }
    if (service.network_mode !== undefined) {
      hostConfig.NetworkMode = service.network_mode
    }
    if (service.cap_add !== undefined) {
      hostConfig.CapAdd = service.cap_add
    }
    if (service.cap_drop !== undefined) {
      hostConfig.CapDrop = service.cap_drop
    }

    // 5. Map Restart Conditions
    if (service.restart !== undefined) {
      const nameMap: Record<string, "no" | "always" | "on-failure" | "unless-stopped"> = {
        no: "no",
        always: "always",
        "on-failure": "on-failure",
        "unless-stopped": "unless-stopped",
      }
      hostConfig.RestartPolicy = {
        Name: nameMap[service.restart] ?? "no",
      }
    }

    // 6. Map Ports (Complex Object / Short string variants parsing)
    if (service.ports !== undefined) {
      const bindings: Record<string, Array<{ HostPort: string; HostIp?: string }>> = {}

      for (const portEntry of service.ports) {
        if (typeof portEntry === "string") {
          const parts = portEntry.split(":")

          if (parts.length === 3) {
            const ip = parts[0]
            const hostPort = parts[1]
            const containerPort = parts[2]
            if (containerPort !== undefined && hostPort !== undefined) {
              const key = containerPort.includes("/") ? containerPort : `${containerPort}/tcp`
              bindings[key] = [
                {
                  HostPort: hostPort,
                  ...(ip !== undefined ? { HostIp: ip } : {}),
                },
              ]
            }
          } else if (parts.length === 2) {
            const hostPort = parts[0]
            const containerPort = parts[1]
            if (containerPort !== undefined && hostPort !== undefined) {
              const key = containerPort.includes("/") ? containerPort : `${containerPort}/tcp`
              bindings[key] = [{ HostPort: hostPort }]
            }
          } else {
            const containerPort = parts[0]
            if (containerPort !== undefined) {
              const key = containerPort.includes("/") ? containerPort : `${containerPort}/tcp`
              bindings[key] = [{ HostPort: "" }]
            }
          }
        } else {
          const targetPort = portEntry.target
          if (targetPort !== undefined) {
            const proto = portEntry.protocol ?? "tcp"
            const key = `${targetPort}/${proto}`

            bindings[key] = [
              {
                HostPort: portEntry.published !== undefined ? String(portEntry.published) : "",
                ...(portEntry.host_ip !== undefined ? { HostIp: portEntry.host_ip } : {}),
              },
            ]
          }
        }
      }
      hostConfig.PortBindings = bindings
    }

    // 7. Map Volumes & Binds ((string | ServiceVolume)[])
    if (service.volumes !== undefined) {
      const bindList: string[] = []

      for (const vol of service.volumes) {
        if (typeof vol === "string") {
          bindList.push(vol)
        } else if (vol.type === "bind" || vol.type === "volume") {
          if (vol.source !== undefined) {
            const mode = vol.read_only === true ? ":ro" : ""
            bindList.push(`${vol.source}:${vol.target}${mode}`)
          }
        }
      }
      hostConfig.Binds = bindList
    }

    return config
  }
}
