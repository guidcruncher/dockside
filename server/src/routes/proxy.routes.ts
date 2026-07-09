import { type FastifyPluginAsync } from "fastify"
import { Type } from "@sinclair/typebox"

import type { PersistentWorkspaceStore } from "#/store/workspaceStore.js"

// -----------------------------
// Schemas
// -----------------------------

const ProxyParamsSchema = Type.Object({
  dsid: Type.String(),
})

const ProxyConfigSchema = Type.Object({
  config: Type.String(),
})

const ProxyConfigResponseSchema = Type.Object({
  config: Type.String(),
})

const ProxyCompileResponseSchema = Type.Object({
  compiled: Type.String(),
})

// -----------------------------
// Plugin
// -----------------------------

export const proxyRoutes: FastifyPluginAsync = async (fastify) => {
  const { proxyService } = fastify.dockside.services

  // -----------------------------------------
  // GET /:dsid
  // -----------------------------------------
  fastify.route({
    method: "GET",
    url: "/:dsid",
    schema: {
      tags: ["proxy"],
      summary: "Get proxy config for a project",
      params: ProxyParamsSchema,
      response: {
        200: ProxyConfigResponseSchema,
        404: Type.Object({ error: Type.String() }),
      },
    },
    handler: async (req, reply) => {
      const { dsid } = req.params as { dsid: string }
      const cfg = await proxyService.getProxyConfig(dsid)

      if (cfg === undefined) {
        return reply.code(404).send({ error: `Project '${dsid}' not found` })
      }

      return { config: cfg }
    },
  })

  // -----------------------------------------
  // POST /:dsid
  // -----------------------------------------
  fastify.route({
    method: "POST",
    url: "/:dsid",
    schema: {
      tags: ["proxy"],
      summary: "Save proxy config for a project",
      params: ProxyParamsSchema,
      body: ProxyConfigSchema,
      response: {
        200: Type.Object({ ok: Type.Boolean() }),
        404: Type.Object({ error: Type.String() }),
      },
    },
    handler: async (req, reply) => {
      const { dsid } = req.params as { dsid: string }
      const { config } = req.body as { config: string }

      const result = await proxyService.saveProxyConfig(dsid, config)
      if (result === undefined) {
        return reply.code(404).send({ error: `Project '${dsid}' not found` })
      }

      return { ok: true }
    },
  })

  // -----------------------------------------
  // GET /compile
  // -----------------------------------------
  fastify.route({
    method: "GET",
    url: "/compile",
    schema: {
      tags: ["proxy"],
      summary: "Compile all proxy configs into a single output",
      response: {
        200: ProxyCompileResponseSchema,
      },
    },
    handler: async () => {
      const compiled = await proxyService.compileConfig()
      return { compiled }
    },
  })

  // -----------------------------------------
  // GET /publish
  // -----------------------------------------
  fastify.route({
    method: "GET",
    url: "/publish",
    schema: {
      tags: ["proxy"],
      summary: "Compile all proxy configs and commits them to the file system",
    },
    handler: async () => {
      return proxyService.commitConfig()
    },
  })
}
