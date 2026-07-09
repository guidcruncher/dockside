import { Type } from "@sinclair/typebox"

// ---------------------------------------------------------
// PortainerTemplateType enum
// ---------------------------------------------------------
export const PortainerTemplateType = Type.Union([Type.Literal(1), Type.Literal(2), Type.Literal(3)])

// ---------------------------------------------------------
// RestartPolicy enum
// ---------------------------------------------------------
export const RestartPolicy = Type.Union([
  Type.Literal("always"),
  Type.Literal("unless-stopped"),
  Type.Literal("on-failure"),
  Type.Literal("no"),
])

// ---------------------------------------------------------
// TemplateVolume schema
// ---------------------------------------------------------
export const TemplateVolume = Type.Object({
  bind: Type.Optional(Type.String()),
  container: Type.String(),
})

// ---------------------------------------------------------
// TemplateEnvironmentVar schema
// ---------------------------------------------------------
export const TemplateEnvironmentVar = Type.Object({
  name: Type.String(),
  label: Type.Optional(Type.String()),
})

// ---------------------------------------------------------
// PortainerTemplateEntry schema
// ---------------------------------------------------------
export const PortainerTemplateEntry = Type.Object({
  type: PortainerTemplateType,
  title: Type.String(),
  description: Type.String(),
  categories: Type.Array(Type.String()),
  platform: Type.Optional(Type.String()),
  logo: Type.String({ format: "uri" }),
  image: Type.Optional(Type.String()),

  restart_policy: Type.Optional(RestartPolicy),
  ports: Type.Optional(Type.Array(Type.String())),
  volumes: Type.Optional(Type.Array(TemplateVolume)),
  environment: Type.Optional(Type.Array(TemplateEnvironmentVar)),
})

// ---------------------------------------------------------
// PortainerAppTemplate root schema
// ---------------------------------------------------------
export const PortainerAppTemplate = Type.Object({
  version: Type.String(),
  templates: Type.Array(PortainerTemplateEntry),
})
