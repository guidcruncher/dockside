// src/composables/useServiceNormalizer.ts
// src/composables/useServiceNormalizer.ts
import type {
  Protocol,
  ServiceSecretOrConfig,
  ServiceLogging,
  ServiceHealthcheck,
  ServiceDeploy,
  Service,
  ServiceVolume,
  ServicePort,
  ServiceBuild,
} from "@/types"

export function useServiceNormalizer() {
  class ServiceNormalizer {
    static normalize(name: string, raw: any): Service {
      return {
        // BASIC
        name: name,
        image: raw.image ?? "",
        build: this.normalizeBuild(raw.build),
        command: this.normalizeCommand(raw.command),
        container_name: raw.container_name ?? "",
        entrypoint: this.normalizeCommand(raw.entrypoint),

        // ENVIRONMENT
        environment: this.normalizeEnvironment(raw.environment),
        env_file: this.normalizeStringOrArray(raw.env_file),

        // PORTS / VOLUMES
        ports: this.normalizePorts(raw.ports),
        volumes: this.normalizeVolumes(raw.volumes),

        // NETWORKING
        networks: this.normalizeNetworks(raw.networks),
        network_mode: raw.network_mode ?? "",
        hostname: raw.hostname ?? "",
        domainname: raw.domainname ?? "",
        dns: this.normalizeStringOrArray(raw.dns),
        dns_search: this.normalizeStringOrArray(raw.dns_search),
        extra_hosts: this.normalizeExtraHosts(raw.extra_hosts),
        expose: this.normalizeExpose(raw.expose),

        // DEPENDENCIES
        depends_on: this.normalizeDependsOn(raw.depends_on),
        links: this.normalizeStringArray(raw.links),

        // CAPABILITIES
        cap_add: Array.isArray(raw.cap_add) ? raw.cap_add : [],
        cap_drop: Array.isArray(raw.cap_drop) ? raw.cap_drop : [],

        // RUNTIME FLAGS
        privileged: raw.privileged ?? false,
        read_only: raw.read_only ?? false,
        tty: raw.tty ?? false,
        stdin_open: raw.stdin_open ?? false,
        init: raw.init ?? false,

        // HEALTHCHECK / DEPLOY / LOGGING
        healthcheck: this.normalizeHealthcheck(raw.healthcheck),
        deploy: this.normalizeDeploy(raw.deploy),
        logging: this.normalizeLogging(raw.logging),

        // LABELS / SYSCTLS / ULIMITS / STORAGE
        labels: this.normalizeLabels(raw.labels),
        sysctls: this.normalizeSysctls(raw.sysctls),
        ulimits: this.normalizeUlimits(raw.ulimits),
        storage_opt: this.normalizeStorageOpt(raw.storage_opt),

        // SECRETS / CONFIGS
        secrets: this.normalizeSecrets(raw.secrets),
        configs: this.normalizeConfigs(raw.configs),

        // MISC
        devices: this.normalizeStringArray(raw.devices),
        profiles: this.normalizeStringArray(raw.profiles),
        tmpfs: this.normalizeStringOrArray(raw.tmpfs),
        user: raw.user ?? "",
        working_dir: raw.working_dir ?? "",
        stop_signal: raw.stop_signal ?? "",
        stop_grace_period: raw.stop_grace_period ?? "",
        shm_size: raw.shm_size ?? "",
        pid: raw.pid ?? null,
        mac_address: raw.mac_address ?? "",
        cgroup_parent: raw.cgroup_parent ?? "",
        isolation: raw.isolation ?? "",
        env_prefix: raw.env_prefix ?? "",
      }
    }

    // -----------------------------
    // BASIC NORMALIZERS
    // -----------------------------
    static normalizeBuild(build: any): ServiceBuild | undefined {
      if (!build) return undefined
      if (typeof build === "string") return { context: build }
      return {
        context: build.context ?? "",
        dockerfile: build.dockerfile ?? "",
        args: build.args ?? {},
        target: build.target ?? "",
      }
    }

    static normalizeCommand(cmd: any) {
      if (!cmd) return ""
      if (Array.isArray(cmd)) return cmd.join(" ")
      return String(cmd)
    }

    static normalizeStringOrArray(v: any): string[] {
      if (!v) return []
      if (Array.isArray(v)) return v.map(String)
      return [String(v)]
    }

    static normalizeStringArray(v: any): string[] {
      if (!v) return []
      if (Array.isArray(v)) return v.map(String)
      return [String(v)]
    }

    // -----------------------------
    // ENVIRONMENT
    // -----------------------------
    static normalizeEnvironment(env: any) {
      if (!env) return {}
      if (Array.isArray(env)) {
        const obj: Record<string, string> = {}
        env.forEach((e: string) => {
          const [k, v] = e.split("=")
          obj[k] = v ?? ""
        })
        return obj
      }
      return env
    }

    // -----------------------------
    // PORTS
    // -----------------------------
    static normalizePorts(ports: any) {
      if (!Array.isArray(ports)) return []
      return ports.map((p) => this.normalizePort(p))
    }

    static normalizePort(p: any): ServicePort {
      if (typeof p === "string") {
        const [mapping, protoRaw = "tcp"] = p.split("/")
        const [published, target] = mapping.split(":").map(Number)

        const allowed: Protocol[] = ["tcp", "udp", "sctp"]
        const protocol = allowed.includes(protoRaw as Protocol) ? (protoRaw as Protocol) : "tcp"

        return {
          published,
          target,
          protocol,
          description: "",
        }
      }

      return {
        published: Number(p.published) || 0,
        target: Number(p.target) || 0,
        protocol: p.protocol ?? "tcp",
        description: p.description ?? "",
      }
    }

    // -----------------------------
    // VOLUMES
    // -----------------------------
    static normalizeVolumes(vols: any) {
      if (!Array.isArray(vols)) return []
      return vols.map((v) => this.normalizeVolume(v))
    }

    static normalizeVolume(v: any): ServiceVolume {
      if (typeof v === "string") {
        const [source, target] = v.split(":")
        return {
          type: "bind",
          source,
          target,
        }
      }
      return {
        type: v.type ?? "bind",
        source: v.source ?? "",
        target: v.target ?? "",
      }
    }

    // -----------------------------
    // NETWORKS
    // -----------------------------
    static normalizeNetworks(nets: any): string[] {
      if (!nets) return []
      if (Array.isArray(nets)) return nets
      return Object.keys(nets)
    }

    // -----------------------------
    // DEPENDS_ON
    // -----------------------------
    static normalizeDependsOn(dep: any): any {
      if (!dep) return []
      if (Array.isArray(dep)) return dep
      return dep
    }

    // -----------------------------
    // EXTRA HOSTS
    // -----------------------------
    static normalizeExtraHosts(hosts: any) {
      if (!hosts) return {}
      if (Array.isArray(hosts)) {
        const obj: Record<string, string> = {}
        hosts.forEach((h: string) => {
          const [k, v] = h.split(":")
          obj[k] = v ?? ""
        })
        return obj
      }
      return hosts
    }

    // -----------------------------
    // EXPOSE
    // -----------------------------
    static normalizeExpose(expose: any): (string | number)[] {
      if (!expose) return []
      if (Array.isArray(expose)) return expose
      return [expose]
    }

    // -----------------------------
    // HEALTHCHECK
    // -----------------------------
    static normalizeHealthcheck(hc: any): ServiceHealthcheck | undefined {
      if (!hc) return undefined
      return {
        test: Array.isArray(hc.test) ? hc.test.join(" ") : (hc.test ?? ""),
        interval: hc.interval ?? "",
        timeout: hc.timeout ?? "",
        retries: hc.retries ?? 0,
        start_period: hc.start_period ?? "",
      }
    }

    // -----------------------------
    // DEPLOY
    // -----------------------------
    static normalizeDeploy(deploy: any): ServiceDeploy | undefined {
      if (!deploy) return undefined
      return {
        mode: deploy.mode ?? "",
        replicas: deploy.replicas ?? 1,
        restart_policy: deploy.restart_policy ?? {},
        resources: deploy.resources ?? {},
        placement: deploy.placement ?? {},
      }
    }

    // -----------------------------
    // LOGGING
    // -----------------------------
    static normalizeLogging(logging: any): ServiceLogging | undefined {
      if (!logging) return undefined
      return {
        driver: logging.driver ?? "",
        options: logging.options ?? {},
      }
    }

    // -----------------------------
    // LABELS
    // -----------------------------
    static normalizeLabels(labels: any) {
      if (!labels) return {}
      if (Array.isArray(labels)) {
        const obj: Record<string, string> = {}
        labels.forEach((l: string) => {
          const [k, v] = l.split("=")
          obj[k] = v ?? ""
        })
        return obj
      }
      return labels
    }

    // -----------------------------
    // SYSCTLS / ULIMITS / STORAGE
    // -----------------------------
    static normalizeSysctls(sc: any) {
      if (!sc) return {}
      return sc
    }

    static normalizeUlimits(raw: any): Record<string, { soft?: number; hard?: number }> {
      if (!raw || typeof raw !== "object") return {}

      const out: Record<string, { soft?: number; hard?: number }> = {}

      for (const key of Object.keys(raw)) {
        const val = raw[key]

        if (typeof val === "number") {
          // Convert: nofile: 1024
          out[key] = { soft: val, hard: val }
        } else if (typeof val === "object" && val !== null) {
          // Already structured
          out[key] = {
            soft: val.soft ?? undefined,
            hard: val.hard ?? undefined,
          }
        }
      }

      return out
    }

    static normalizeStorageOpt(opt: any) {
      if (!opt) return {}
      return opt
    }

    // -----------------------------
    // SECRETS / CONFIGS
    // -----------------------------
    static normalizeSecrets(secrets: any): ServiceSecretOrConfig[] {
      if (!secrets) return []

      // Array syntax
      if (Array.isArray(secrets)) {
        return secrets.map((s) => {
          if (typeof s === "string") {
            return {
              source: s,
              target: "",
              uid: "",
              gid: "",
              mode: 0,
            }
          }

          return {
            source: s.source ?? "",
            target: s.target ?? "",
            uid: s.uid ?? "",
            gid: s.gid ?? "",
            mode: Number(s.mode ?? 0),
          }
        })
      }

      // Object syntax
      return Object.keys(secrets).map((key) => ({
        source: key,
        target: "",
        uid: "",
        gid: "",
        mode: 0,
      }))
    }

    static normalizeConfigs(configs: any): ServiceSecretOrConfig[] {
      if (!configs) return []

      if (Array.isArray(configs)) {
        return configs.map((c) => {
          if (typeof c === "string") {
            return {
              source: c,
              target: "",
              uid: "",
              gid: "",
              mode: 0,
            }
          }

          return {
            source: c.source ?? "",
            target: c.target ?? "",
            uid: c.uid ?? "",
            gid: c.gid ?? "",
            mode: Number(c.mode ?? 0),
          }
        })
      }

      return Object.keys(configs).map((key) => ({
        source: key,
        target: "",
        uid: "",
        gid: "",
        mode: 0,
      }))
    }
  }

  return {
    normalizeService: ServiceNormalizer.normalize.bind(ServiceNormalizer),
    normalizePort: ServiceNormalizer.normalizePort.bind(ServiceNormalizer),
    normalizeVolume: ServiceNormalizer.normalizeVolume.bind(ServiceNormalizer),
  }
}
