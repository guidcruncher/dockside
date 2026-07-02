// src/api/registryApiPlugin.ts
import type { FastifyInstance, FastifyPluginAsync } from "fastify"
import { Type } from "@sinclair/typebox"

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
}
