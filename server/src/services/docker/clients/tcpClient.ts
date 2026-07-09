import http from "http"
import { commonRequestHandler } from "./commonRequest.js"
import type { DockerRequestOptions, LocalClient } from "./localClient.js"

export class TcpClient implements LocalClient {
  private readonly agent = new http.Agent()
  private readonly hostName: string
  private readonly port: number

  constructor(hostName: string, port = 2375) {
    this.hostName = hostName
    this.port = port
  }

  request<T>(options: DockerRequestOptions): Promise<T> {
    return new Promise((resolve, reject) => {
      const incomingHeaders: Record<string, string | string[] | undefined> = options.headers ?? {}

      const req = http.request(
        {
          hostname: this.hostName,
          port: this.port,
          path: options.path,
          method: options.method ?? "GET",
          headers: {
            "Content-Type": "application/json",
            ...incomingHeaders,
          },
          agent: this.agent,
        },
        (res) => {
          commonRequestHandler<T>(res, options).then(resolve).catch(reject)
        },
      )

      req.on("error", reject)

      if (options.body !== undefined) {
        req.write(JSON.stringify(options.body))
      }

      req.end()
    })
  }
}
