import type { FastifyInstance } from "fastify"
import swagger from "@fastify/swagger"
import swaggerUi from "@fastify/swagger-ui"
import type { Config } from "#/config/types.js"
import { loadConfig } from "#/config/loader.js"

export const swaggerRoutes = (fastify: FastifyInstance) => {
  const config: Config = loadConfig()

  fastify.register(swagger, {
    openapi: {
      info: {
        title: "Dockside API",
        description: "Dockaide server API",
        version: "1.0.0",
      },
      servers: [
        {
          url: `${config.server.baseUrl}`,
          description: "Development environment",
        },
      ],
    },
  })

  fastify.register(swaggerUi, {
    routePrefix: "/api/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
  })

  fastify.get("/api/docs/openapi.yaml", async () => {
    const spec = fastify.swagger({ yaml: true })
    return spec
  })
}
