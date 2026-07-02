import type { FastifyPluginAsync } from "fastify"
import { workspaceRoutes } from "./workspace.routes.js"
import { composeDeployerRoutes } from "./composeDeployer.routes.js"
import { systemRoutes } from "./docker-system.routes.js"
import { containerRoutes } from "./docker-container.routes.js"
import { imageRoutes } from "./docker-images.routes.js"
import { orchestrationRoutes } from "./docker-orchestration.routes.js"
import { registryRoutes } from "./registry.routes.js"
import { templateRoutes } from "./template.routes.js"

export const apiRoutes: FastifyPluginAsync = async (fastify) => {
  // Register separate feature domains under distinct endpoints
  await fastify.register(workspaceRoutes, { prefix: "/workspace" })
  await fastify.register(composeDeployerRoutes, { prefix: "/deploy" })

  await fastify.register(systemRoutes, { prefix: "/docker/system" })
  await fastify.register(containerRoutes, { prefix: "/docker/containers" })
  await fastify.register(imageRoutes, { prefix: "/docker/images" })
  await fastify.register(orchestrationRoutes, { prefix: "/docker/orchestration" })
  await fastify.register(registryRoutes, { prefix: "/registry" })
  await fastify.register(templateRoutes, { prefix: "/templates" })
}

// Re-export individual blocks if explicit external picking is needed later
export { workspaceRoutes }
