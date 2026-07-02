import type { Template } from "./types.js"
import type { ComposeConfig } from "#/services/compose/types.js"
import yaml from "yaml"

export const normalizeTemplate = (t: any): ComposeConfig => {
  switch (t.type) {
    case "application/x-yaml":
    case "text/yaml":
      if (typeof t.raw === "string") {
        return yaml.parse(t.raw) as ComposeConfig
      } else {
        return t.raw as ComposeConfig
      }
      break
    case "application/json":
      if (typeof t.raw === "string") {
        return JSON.parse(t.raw) as ComposeConfig
      } else {
        return t.raw as ComposeConfig
      }
      break
  }

  throw new Error(`Unknown template type: ${t.type}`)
}
