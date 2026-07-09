import fs from "node:fs"
import path from "node:path"
import { parse } from "yaml"
import type { Config } from "./types.ts"

const ENV_VAR_REGEX = /\${([^}:]+)(?::-([^}]*))?}|\$([a-zA-Z_][a-zA-Z0-9_]*)/g

function interpolateEnvVars(rawYaml: string): string {
  return rawYaml.replace(ENV_VAR_REGEX, (_, bracedName, defaultValue, unbracedName) => {
    const varName = bracedName || unbracedName
    const envValue = process.env[varName]

    if (envValue !== undefined) {
      return envValue
    }

    if (defaultValue !== undefined) {
      return defaultValue
    }

    return ""
  })
}

/**
 * Loads and parses a YAML configuration file.
 * By default, it resolves the path relative to the application's startup folder (process.cwd()).
 * * @param filename - The name or relative path of the config file. Defaults to "config.yaml".
 */
export function loadConfig(filename: string = "config.yaml"): Config {
  // process.cwd() points directly to the startup root directory
  const absolutePath = path.resolve(process.cwd(), filename)

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Config file not found at startup directory: ${absolutePath}`)
  }

  const rawContent = fs.readFileSync(absolutePath, "utf8")
  const interpolatedContent = interpolateEnvVars(rawContent)

  return parse(interpolatedContent) as Config
}
