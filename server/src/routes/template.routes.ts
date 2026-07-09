// src/api/registryApiPlugin.ts
import type { FastifyInstance, FastifyPluginAsync } from "fastify"
import { Type } from "@sinclair/typebox"
import { ComposeConfigSchema } from "#/services/compose/schemas.js"
import { ComposeFromTemplate } from "#/services/templates/composeFromTemplate.js"

import { TemplateSchema, TemplateIndexSchema } from "../services/templates/schemas.js"

export const templateRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const { templateStore } = fastify.dockside.services

  fastify.route({
    method: "GET",
    url: "/",
    schema: {
      summary: "Fetch a list of available templates",
      tags: ["templates"],
      response: {
        200: TemplateIndexSchema,
      },
    },
    handler: async (req, reply) => {
      const index = await templateStore.getLocalIndex()
      return reply.send(index)
    },
  })

  fastify.route({
    method: "GET",
    url: "/:name",
    schema: {
      summary: "Fetch a template",
      tags: ["templates"],
      params: Type.Object({
        name: Type.String(),
      }),
      response: {
        200: TemplateSchema,
      },
    },
    handler: async (req, reply) => {
      const { name } = req.params as { name: string }
      const template = await templateStore.getLocalTemplate(name)
      return reply.send(template)
    },
  })

  // ---------------------------------------------------------
  // GET /templates/:id/compose
  // ---------------------------------------------------------
  fastify.get(
    "/templates/:name/compose",
    {
      schema: {
        tags: ["templates"],
        summary: "Create a compose config",
        description: "Returns a compose config for a given template name.",
        params: Type.Object({
          name: Type.String(),
        }),
        response: {
          200: ComposeConfigSchema,
          404: Type.Object({ error: Type.String() }),
        },
      },
    },
    async (req, reply) => {
      const { name } = req.params as { name: string }
      const t = await templateStore.getLocalTemplate(name)

      if (!t) return reply.code(404).send({ error: "Template not found" })
      const builder = new ComposeFromTemplate(t)
      const config = await builder.build()
      return config
    },
  )
}
