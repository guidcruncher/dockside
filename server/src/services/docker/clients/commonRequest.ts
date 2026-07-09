import { IncomingMessage } from "http"
import type { DockerRequestOptions } from "./localClient.js"

export interface NormalizedDockerError extends Error {
  statusCode?: number
  dockerMessage?: string
}

export function commonRequestHandler<T>(
  res: IncomingMessage,
  options: DockerRequestOptions,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const { stream } = options

    // STREAMING MODE
    if (stream) {
      // Caller receives the raw stream immediately
      return resolve(res as unknown as T)
    }

    // BUFFERED MODE
    const chunks: Buffer[] = []

    res.on("data", (chunk: Buffer) => chunks.push(chunk))

    res.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8")
      const status = res.statusCode ?? 0

      if (status >= 400) {
        const fallbackMessage = res.statusMessage ?? "Unknown Error"
        const err: NormalizedDockerError = new Error(
          `Docker error ${status}: ${raw || fallbackMessage}`,
        )

        err.statusCode = status

        try {
          const parsed = JSON.parse(raw) as Record<string, unknown> | null
          if (parsed && typeof parsed === "object" && typeof parsed["message"] === "string") {
            err.dockerMessage = parsed["message"]
          }
        } catch {
          /* noop */
        }

        return reject(err)
      }

      if (!raw) {
        return resolve({} as T)
      }

      try {
        return resolve(JSON.parse(raw) as T)
      } catch {
        return resolve(raw as unknown as T)
      }
    })

    res.on("error", reject)
  })
}
