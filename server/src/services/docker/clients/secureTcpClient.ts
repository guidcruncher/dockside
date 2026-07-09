import fs from "fs"
import https from "https"
import path from "path"
import { commonRequestHandler } from "./commonRequest.js"
import type { DockerRequestOptions, LocalClient } from "./localClient.js"

export class SecureTcpClient implements LocalClient {
  private readonly agent: https.Agent
  private readonly hostName: string
  private readonly port: number

  constructor(hostName: string, caPath: string, certPath: string, keyPath: string, port = 2376) {
    this.hostName = hostName
    this.port = port

    this.agent = new https.Agent({
      ca: fs.readFileSync(path.resolve(caPath)),
      cert: fs.readFileSync(path.resolve(certPath)),
      key: fs.readFileSync(path.resolve(keyPath)),
      rejectUnauthorized: true,
    })
  }

  request<T>(options: DockerRequestOptions): Promise<T> {
    return new Promise((resolve, reject) => {
      const incomingHeaders: Record<string, string | string[] | undefined> = options.headers ?? {}

      const req = https.request(
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
