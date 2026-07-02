// src/services/registry/getGhcrToken.ts
import type { Config } from "../../config/types.js"

/**
 * Exchanges a GitHub username + PAT for a GHCR registry token.
 * This token can be used in Authorization: Bearer <token> headers.
 */
export async function getGhcrToken(config: Config): Promise<string> {
  const auth = Buffer.from(`${config.ghcr.username}:${config.ghcr.personalAccessToken}`).toString(
    "base64",
  )

  const res = await fetch("https://ghcr.io/token?scope=repository:*:pull", {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
    },
  })

  if (!res.ok) {
    throw new Error(`GHCR token request failed: ${res.status} ${res.statusText}`)
  }

  const data: any = await res.json()

  if (!data.token) {
    throw new Error("GHCR token response did not include a token")
  }

  return data.token
}
