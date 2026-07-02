import Fastify from "fastify"
import type { FastifyInstance, FastifyServerOptions } from "fastify"
import { swaggerRoutes } from "./routes/swagger.routes.js"
import cors from "@fastify/cors"
import sensible from "@fastify/sensible"
import { apiRoutes } from "./routes/index.js"
import type { Config } from "#/config/types.js"
import { loadConfig } from "#/config/loader.js"
import { diPlugin } from "#/plugins/diPlugin.js"

export function createServer(options: FastifyServerOptions = {}): FastifyInstance {
  const config: Config = loadConfig()
  const app = Fastify(options)

  // 1. Register Core Utility Plugins
  app.register(cors, {
    origin: true, // Configures Access-Control-Allow-Origin based on requests, or set explicit domains
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })

  app.register(sensible)

  // 2. Register Swagger Documentation
  swaggerRoutes(app)

  // 3. Register Plugins
  app.register(diPlugin)
  app.register(apiRoutes, { prefix: "/api/v1" })

  return app
}
