import { parse, stringify } from "yaml"
import type { ComposeConfig } from "./types.js"

/**
 * Parses a YAML string into a structured ComposeConfig object.
 * * @param yamlString - The raw Docker Compose YAML content.
 * @returns A validated type-safe ComposeConfig object.
 * @throws Error if the YAML is malformed.
 */
export function fromYaml(yamlString: string): ComposeConfig {
  if (!yamlString || yamlString.trim() === "") {
    return {}
  }

  try {
    const parsed = parse(yamlString)

    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("Invalid Compose file: Content must be a key-value mapping.")
    }

    // Return typed structure
    return parsed as ComposeConfig
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to parse Docker Compose YAML: ${message}`)
  }
}

/**
 * Serializes a ComposeConfig object back into a standard YAML string.
 * * @param config - The structured ComposeConfig object.
 * @returns A formatted YAML string.
 */
export function toYaml(config: ComposeConfig): string {
  try {
    // Configuration object to optimize the output for readability
    return stringify(config, {
      indent: 2,
      lineWidth: 0, // Prevents unexpected wrapping of long command arrays or images
      aliasDuplicateObjects: false, // Ensures pure value output instead of anchor references (*ref_0)
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to serialize ComposeConfig to YAML: ${message}`)
  }
}
