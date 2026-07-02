import http from "http"
import { commonRequestHandler } from "./commonRequest.js"
import type { DockerRequestOptions, LocalClient } from "./localClient.js"

export class SocketClient implements LocalClient {
  private readonly socketPath: string

  constructor(socketPath = "/var/run/docker.sock") {
    this.socketPath = socketPath
  }

  request<T>(options: DockerRequestOptions): Promise<T> {
    return new Promise((resolve, reject) => {
      const incomingHeaders: Record<string, string | string[] | undefined> = options.headers ?? {}

      const req = http.request(
        {
          socketPath: this.socketPath,
          path: options.path,
          method: options.method ?? "GET",
          headers: {
            "Content-Type": "application/json",
            ...incomingHeaders,
          },
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
