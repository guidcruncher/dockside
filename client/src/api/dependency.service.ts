import { BaseClient } from "./dockside-sdk"

export class DependencyClient extends BaseClient {
  constructor(baseUrl: string, fetchImpl: typeof fetch) {
    super(baseUrl, fetchImpl)
  }

  getDependencyGraph(dsId: string): Promise<any> {
    return this.request(`/api/v1/workspace/projects/${encodeURIComponent(dsId)}/graph`)
  }
}
