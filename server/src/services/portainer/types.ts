// ---------------------------------------------------------
// Portainer App Template v3 Types (based on JSON Schema)
// ---------------------------------------------------------

// Type: 1 = container, 2 = swarm stack
export enum PortainerTemplateType {
  Container = 1,
  SwarmStack = 2,
  Kubernetes = 3,
}

// Restart policy enum
export type RestartPolicy = "always" | "unless-stopped" | "on-failure" | "no"

// Volume mapping
export interface TemplateVolume {
  bind: string // host path (required)
  container: string // container path (required)
}

// Environment variable
export interface TemplateEnvironmentVar {
  name: string // required
  label?: string // optional
}

// Single template entry
export interface PortainerTemplateEntry {
  type: PortainerTemplateType // required (1 or 2)
  title: string // required
  description: string // required
  categories: string[] // required
  platform: string // required
  logo: string // required (URI)
  image: string // required

  restart_policy?: RestartPolicy
  ports?: string[] // "host:container[/tcp|udp]"
  volumes?: TemplateVolume[]
  environment?: TemplateEnvironmentVar[]
}

// Root schema
export interface PortainerAppTemplate {
  version: string // required
  templates: PortainerTemplateEntry[] // required
}
