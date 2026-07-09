import * as fs from "fs"
import * as path from "path"
import type { LocalClient } from "./localClient.js"
import { SecureTcpClient } from "./secureTcpClient.js"
import { SocketClient } from "./socketClient.js"
import { TcpClient } from "./tcpClient.js"

export interface ClientOptions {
  path?: string
  host?: string
  port?: number
  caPath?: string
  certPath?: string
  keyPath?: string
}

export interface ValidatedTlsOptions {
  caPath: string
  certPath: string
  keyPath: string
}

export class ClientFactory {
  /**
   * Create a LocalClient based on explicit type or Docker-style environment variables.
   */
  create(type?: string, opts: ClientOptions = {}): LocalClient {
    // 1. Explicit type always wins
    if (type !== undefined) return this.fromExplicitType(type, opts)
    // 2. Auto-detect from environment (Docker CLI semantics)
    const envClient = this.fromEnvironment()
    if (envClient) return envClient
    // 3. Default to Unix socket
    return new SocketClient("/var/run/docker.sock")
  }

  // -------------------------------
  // Explicit type selection
  // -------------------------------
  private fromExplicitType(type: string, opts: ClientOptions): LocalClient {
    switch (type) {
      case "socket":
        return new SocketClient(opts.path ?? "/var/run/docker.sock")
      case "tcp":
        return new TcpClient(opts.host ?? "localhost", opts.port ?? 2375)
      case "securetcp": {
        const tls = this.validateTlsFiles(opts)
        return new SecureTcpClient(
          opts.host ?? "localhost",
          tls.caPath,
          tls.certPath,
          tls.keyPath,
          opts.port ?? 2376,
        )
      }
      default:
        throw new Error(`Unknown client type: ${type}`)
    }
  }

  // -------------------------------
  // Docker CLI-style environment detection
  // -------------------------------
  private fromEnvironment(): LocalClient | null {
    const host = process.env["DOCKER_HOST"]
    const tlsVerify = process.env["DOCKER_TLS_VERIFY"] === "1"
    const certPath = process.env["DOCKER_CERT_PATH"]

    if (!host) return null

    // unix:///var/run/docker.sock
    if (host.startsWith("unix://")) {
      return new SocketClient(host.replace("unix://", ""))
    }

    // tcp://host:2375
    if (host.startsWith("tcp://") && !tlsVerify) {
      const { hostname, port } = this.parseTcpUrl(host)
      return new TcpClient(hostname, port)
    }

    // https://host:2376 (TLS)
    if (tlsVerify) {
      if (!certPath) {
        throw new Error("DOCKER_TLS_VERIFY=1 but DOCKER_CERT_PATH is not set")
      }
      const ca = path.join(certPath, "ca.pem")
      const cert = path.join(certPath, "cert.pem")
      const key = path.join(certPath, "key.pem")

      this.validateTlsFiles({ caPath: ca, certPath: cert, keyPath: key })
      const { hostname, port } = this.parseTcpUrl(host)
      return new SecureTcpClient(hostname, ca, cert, key, port ?? 2376)
    }

    throw new Error(`Unsupported DOCKER_HOST format: ${host}`)
  }

  // -------------------------------
  // Helpers
  // -------------------------------
  private parseTcpUrl(url: string): { hostname: string; port: number } {
    const stripped = url.replace("tcp://", "").replace("https://", "")
    const parts = stripped.split(":")

    // Safeguard against noUncheckedIndexedAccess
    const hostname = parts[0] ?? "localhost"
    const portStr = parts[1]
    const port = portStr !== undefined ? Number(portStr) : 2375

    return { hostname, port }
  }

  private validateTlsFiles(opts: ClientOptions): ValidatedTlsOptions {
    const { caPath, certPath, keyPath } = opts

    if (!caPath || !certPath || !keyPath) {
      throw new Error("Missing TLS options: caPath, certPath, and keyPath are required.")
    }

    const files: ValidatedTlsOptions = { caPath, certPath, keyPath }

    // Use explicit property checking instead of string-index mapping to satisfy noUncheckedIndexedAccess
    if (!fs.existsSync(files.caPath)) throw new Error(`TLS file not found: ${files.caPath}`)
    if (!fs.existsSync(files.certPath)) throw new Error(`TLS file not found: ${files.certPath}`)
    if (!fs.existsSync(files.keyPath)) throw new Error(`TLS file not found: ${files.keyPath}`)

    return files
  }
}
