import type { ComposeConfig, Service } from "./types.js"

export const graphVizMimeTpe = "text/vnd.graphviz"

export class ComposeDependencyGraph {
  constructor(private compose: ComposeConfig) {}

  /**
   * Normalize services so both syntaxes work:
   * - Object: { web: {...}, db: {...} }
   * - Array:  [ { name: "web", ... }, { name: "db", ... } ]
   */
  private normalizeServices(): Record<string, Service> {
    const raw = this.compose.services

    if (!raw) return {}

    // Already correct
    if (!Array.isArray(raw)) return raw

    // Convert array → dictionary
    const out: Record<string, Service> = {}
    for (const svc of raw) {
      if (!svc.name) {
        throw new Error("Service missing required 'name' property")
      }
      out[svc.name] = svc
    }
    return out
  }

  /** Extract depends_on from both syntaxes */
  private extractDependencies(svc: Service): string[] {
    const deps = svc.depends_on
    if (!deps) return []
    if (Array.isArray(deps)) return deps
    return Object.keys(deps)
  }

  /** Build normal graph: service → dependencies */
  getStartupGraph(): Map<string, string[]> {
    const graph = new Map<string, string[]>()
    const services = this.normalizeServices()

    for (const [name, svc] of Object.entries(services)) {
      graph.set(name, this.extractDependencies(svc))
    }

    return graph
  }

  /** Build reverse graph: service → dependents */
  getShutdownGraph(): Map<string, string[]> {
    const graph = new Map<string, string[]>()
    const services = this.normalizeServices()

    // Initialize nodes
    for (const name of Object.keys(services)) {
      graph.set(name, [])
    }

    // Populate reverse edges
    for (const [name, svc] of Object.entries(services)) {
      const deps = this.extractDependencies(svc)
      for (const dep of deps) {
        graph.get(dep)!.push(name)
      }
    }

    return graph
  }

  /** Generic topological sort */
  private topoSort(graph: Map<string, string[]>): string[] {
    const visited = new Set<string>()
    const temp = new Set<string>()
    const order: string[] = []

    const visit = (node: string) => {
      if (temp.has(node)) {
        throw new Error(`Cycle detected in dependency graph at: ${node}`)
      }
      if (!visited.has(node)) {
        temp.add(node)
        const edges = graph.get(node) ?? []
        for (const dep of edges) visit(dep)
        temp.delete(node)
        visited.add(node)
        order.push(node)
      }
    }

    for (const node of graph.keys()) {
      visit(node)
    }

    return order
  }

  getStartupOrder(): string[] {
    return this.topoSort(this.getStartupGraph())
  }

  getShutdownOrder(): string[] {
    return this.topoSort(this.getShutdownGraph())
  }

  /** DOT for startup graph */
  getStartupDOT(): string {
    const graph = this.getStartupGraph()
    const lines: string[] = []

    lines.push("digraph startup {")
    lines.push('  rankdir="LR";')
    lines.push("  node [shape=box, style=rounded];")

    for (const [svc, deps] of graph.entries()) {
      if (deps.length === 0) {
        lines.push(`  "${svc}";`)
      } else {
        for (const dep of deps) {
          lines.push(`  "${dep}" -> "${svc}";`)
        }
      }
    }

    lines.push("}")
    return lines.join("\n")
  }

  /** DOT for shutdown graph */
  getShutdownDOT(): string {
    const graph = this.getShutdownGraph()
    const lines: string[] = []

    lines.push("digraph shutdown {")
    lines.push('  rankdir="LR";')
    lines.push("  node [shape=box, style=rounded];")

    for (const [svc, dependents] of graph.entries()) {
      if (dependents.length === 0) {
        lines.push(`  "${svc}";`)
      } else {
        for (const dep of dependents) {
          lines.push(`  "${svc}" -> "${dep}";`)
        }
      }
    }

    lines.push("}")
    return lines.join("\n")
  }

  private mapToObject<T>(map: Map<string, T>): Record<string, T> {
    const obj: Record<string, T> = {}
    for (const [key, value] of map.entries()) {
      obj[key] = value
    }
    return obj
  }

  getResult() {
    return {
      startupGraph: this.mapToObject(this.getStartupGraph()),
      startupOrder: this.getStartupOrder(),
      shutdownGraph: this.mapToObject(this.getShutdownGraph()),
      shutdownOrder: this.getShutdownOrder(),
    }
  }
}
