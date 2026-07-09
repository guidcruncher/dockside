import { BaseClient } from "./dockside-sdk"

export interface PortainerSearchParams {
  q?: string
  categories?: string[] | string
}

export class PortainerClient extends BaseClient {
  constructor(baseUrl: string, fetchImpl: typeof fetch) {
    super(baseUrl, fetchImpl)
  }

  // ---------------------------------------------------------
  // GET /api/v1/templates/portainer/templates
  // ---------------------------------------------------------
  getTemplates(): Promise<any[]> {
    return this.request("/api/v1/templates/portainer/templates")
  }

  // ---------------------------------------------------------
  // GET /api/v1/templates/portainer/templates/categories
  // ---------------------------------------------------------
  getCategories(): Promise<string[]> {
    return this.request("/api/v1/templates/portainer/templates/categories")
  }

  // ---------------------------------------------------------
  // GET /api/v1/templates/portainer/templates/search
  // ---------------------------------------------------------
  searchTemplates(params: PortainerSearchParams): Promise<any[]> {
    return this.request(`/api/v1/templates/portainer/templates/search${this.buildQuery(params)}`)
  }

  // ---------------------------------------------------------
  // GET /api/v1/templates/portainer/templates/:title
  // ---------------------------------------------------------
  getTemplate(id: number): Promise<any> {
    return this.request(`/api/v1/templates/portainer/templates/${id}`)
  }

  compose(id: number): Promise<any> {
    return this.request(`/api/v1/templates/portainer/templates/${id}/compose`)
  }

  // ---------------------------------------------------------
  // POST /api/v1/templates/portainer/templates/refresh
  // ---------------------------------------------------------
  refresh(): Promise<{ ok: boolean }> {
    return this.request("/api/v1/templates/portainer/templates/refresh", {
      method: "POST",
    })
  }
}
