import type { ClientOptions } from "../services/docker/clients/clientFactory.js"

export interface DockerClientConfig extends ClientOptions {
  type: "socket" | "tcp" | "securetcp"
}

export interface Config {
  workspace: {
    folder: string
  }
  templates: {
    folder: string
    portainer: {
      cache: string
      url: string
    }
  }
  server: {
    host: string
    port: number
    baseUrl: string
    logLevel: string
  }
  ghcr: {
    personalAccessToken: string
    username: string
  }
  proxy: {
    configFolder: string
    container: string
    useImports: boolean
  }
  clientopts?: DockerClientConfig
}
