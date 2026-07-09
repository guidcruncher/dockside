import { Type } from "@sinclair/typebox"
import type { Static } from "@sinclair/typebox"
import type { ComposeConfig } from "#/services/compose/types.js"
import { ComposeConfigSchema } from "#/services/compose/schemas.js"

/**
 * TemplateIndexEntry
 */
export const TemplateIndexEntrySchema = Type.Object({
  name: Type.String(),
  version: Type.Number(),
})

export type TemplateIndexEntrySchemaType = Static<typeof TemplateIndexEntrySchema>

/**
 * TemplateIndex = Record<string, TemplateIndexEntry>
 */
export const TemplateIndexSchema = Type.Record(Type.String(), TemplateIndexEntrySchema)

export type TemplateIndexSchemaType = Static<typeof TemplateIndexSchema>

/**
 * Template
 */
export const TemplateSchema = Type.Object({
  name: Type.String(),
  logo: Type.String(),
  author: Type.String(),
  license: Type.String(),
  description: Type.String(),
  weburl: Type.String(),
  docsurl: Type.String(),
  type: Type.Union([
    Type.Literal("application/x-yaml"),
    Type.Literal("text/yaml"),
    Type.Literal("application/json"),
  ]),
  raw: ComposeConfigSchema,
})

export type TemplateSchemaType = Static<typeof TemplateSchema>
