import { BaseClient } from "./dockside-sdk"

export interface ProxyConfig {
  config: string
}

export class ProxyClient extends BaseClient {
  constructor(baseUrl: string, fetchImpl: typeof fetch) {
    super(baseUrl, fetchImpl)
  }

  getProxyConfig(name: string): Promise<ProxyConfig> {
    return this.request(`/api/v1/proxy/${encodeURIComponent(name)}`)
  }

  saveProxyConfig(name: string, config: ProxyConfig): Promise<void> {
    return this.request(`/api/v1/proxy/${encodeURIComponent(name)}`, {
      method: "POST",
      body: JSON.stringify(config),
    })
  }
}
