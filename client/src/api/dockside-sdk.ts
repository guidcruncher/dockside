// dockside-sdk.ts

export interface DocksideClientOptions {
  baseUrl?: string
  fetchImpl?: typeof fetch
}

export interface ErrorResponse {
  message: string
}

export class BaseClient {
  protected baseUrl: string
  protected fetchImpl: typeof fetch

  constructor(baseUrl: string, fetchImpl: typeof fetch) {
    this.baseUrl = baseUrl
    this.fetchImpl = fetchImpl
  }

  buildQuery(params?: Record<string, any>): string {
    if (!params) return ""
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) qs.append(k, String(v))
    }
    const s = qs.toString()
    return s ? `?${s}` : ""
  }

  protected async request<T>(path: string, init?: RequestInit): Promise<T> {
    let res

    if (init?.body) {
      res = await this.fetchImpl(`${this.baseUrl}${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
        ...init,
      })
    } else {
      res = await this.fetchImpl(`${this.baseUrl}${path}`, {
        headers: {
          ...(init?.headers ?? {}),
        },
        ...init,
      })
    }

    const text = await res.text()
    const data = text ? JSON.parse(text) : undefined
    if (!res.ok) {
      const err: ErrorResponse =
        data && typeof data === "object" && "message" in data
          ? data
          : { message: `HTTP ${res.status}` }
      throw new Error(err.message)
    }

    return data as T
  }
}
