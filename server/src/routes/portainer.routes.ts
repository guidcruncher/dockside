import type { FastifyPluginAsync, FastifyInstance } from "fastify"
import { Type } from "@sinclair/typebox"
import { PortainerTemplateStore } from "#/services/portainer/templateStore.js"
import { ComposeConfigSchema } from "#/services/compose/schemas.js"
import { ComposeFromPortainerTemplate } from "#/services/portainer/composeFromPortainerTemplate.js"

import { PortainerTemplateEntry, PortainerAppTemplate } from "#/services/portainer/schemas.js"

// ---------------------------------------------------------
// Shared Fastify schemas
// ---------------------------------------------------------

const TemplateEntrySchema = PortainerTemplateEntry
const TemplateListSchema = Type.Array(TemplateEntrySchema)

const CategoryListSchema = Type.Array(Type.String())

const SearchQuerySchema = Type.Object({
  q: Type.Optional(Type.String()),
  categories: Type.Optional(Type.Union([Type.String(), Type.Array(Type.String())])),
})

const IdParamSchema = Type.Object({
  id: Type.Number(),
})

const RefreshResponseSchema = Type.Object({
  ok: Type.Boolean(),
})

// ---------------------------------------------------------
// Fastify Plugin
// ---------------------------------------------------------
export const portainerRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const { dockside } = fastify

  // ---------------------------------------------------------
  // GET /portainer/templates
  // ---------------------------------------------------------
  fastify.get(
    "/templates",
    {
      schema: {
        tags: ["portainer"],
        summary: "List all Portainer templates",
        description: "Returns all templates (type 3 excluded automatically).",
      },
    },
    async () => dockside.services.portainerTemplateStore.getAll(),
  )

  // ---------------------------------------------------------
  // GET /templates/categories
  // ---------------------------------------------------------
  fastify.get(
    "/templates/categories",
    {
      schema: {
        tags: ["portainer"],
        summary: "List all categories",
        description: "Returns a sorted, unique list of categories.",
        response: {
          200: CategoryListSchema,
        },
      },
    },
    async () => dockside.services.portainerTemplateStore.getCategories(),
  )

  // ---------------------------------------------------------
  // GET /templates/search
  // ---------------------------------------------------------
  fastify.get(
    "/templates/search",
    {
      schema: {
        tags: ["portainer"],
        summary: "Search templates",
        description:
          "Search by keyword (title, description, categories) and optional category filters.",
        querystring: SearchQuerySchema,
      },
    },
    async (req) => {
      const { q = "", categories } = req.query as {
        q?: string
        categories?: string | string[]
      }

      const categoryList = Array.isArray(categories)
        ? categories
        : categories
          ? [categories]
          : undefined

      return dockside.services.portainerTemplateStore.filter(q, categoryList)
    },
  )

  // ---------------------------------------------------------
  // GET /templates/:id
  // ---------------------------------------------------------
  fastify.get(
    "/templates/:id",
    {
      schema: {
        tags: ["portainer"],
        summary: "Get template by id",
        description: "Returns a single template by its id.",
        params: IdParamSchema,
        response: {
          404: Type.Object({ error: Type.String() }),
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: number }
      const t = dockside.services.portainerTemplateStore.getById(id)
      if (!t) return reply.code(404).send({ error: "Template not found" })
      return t
    },
  )

  // ---------------------------------------------------------
  // POST /templates/refresh
  // ---------------------------------------------------------
  fastify.post(
    "/templates/refresh",
    {
      schema: {
        tags: ["portainer"],
        summary: "Refresh template cache",
        description: "Clears the local cache and reloads the remote Portainer template file.",
        response: {
          200: RefreshResponseSchema,
        },
      },
    },
    async () => {
      await dockside.services.portainerTemplateStore.clearCache()
      await dockside.services.portainerTemplateStore.load()
      return { ok: true }
    },
  )

  // ---------------------------------------------------------
  // GET /templates/:id/compose
  // ---------------------------------------------------------
  fastify.get(
    "/templates/:id/compose",
    {
      schema: {
        tags: ["portainer"],
        summary: "Create a compose config",
        description: "Returns a compose config for a given template id.",
        params: IdParamSchema,
        response: {
          200: ComposeConfigSchema,
          404: Type.Object({ error: Type.String() }),
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: number }
      const t = dockside.services.portainerTemplateStore.getById(id)
      if (!t) return reply.code(404).send({ error: "Template not found" })

      const builder = new ComposeFromPortainerTemplate(t)
      const config = await builder.build()
      return config
    },
  )
}
