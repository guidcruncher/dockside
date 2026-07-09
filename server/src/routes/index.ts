import type { FastifyPluginAsync } from "fastify"
import { workspaceRoutes } from "./workspace.routes.js"
import { composeDeployerRoutes } from "./composeDeployer.routes.js"
import { dockerSystemRoutes } from "./docker-system.routes.js"
import { containerRoutes } from "./docker-container.routes.js"
import { imageRoutes } from "./docker-images.routes.js"
import { orchestrationRoutes } from "./docker-orchestration.routes.js"
import { registryRoutes } from "./registry.routes.js"
import { templateRoutes } from "./template.routes.js"
import { portainerRoutes } from "./portainer.routes.js"
import { systemRoutes } from "./system.routes.js"
import { proxyRoutes } from "./proxy.routes.js"

export const apiRoutes: FastifyPluginAsync = async (fastify) => {
  // Register separate feature domains under distinct endpoints
  await fastify.register(workspaceRoutes, { prefix: "/workspace" })
  await fastify.register(composeDeployerRoutes, { prefix: "/deploy" })

  await fastify.register(dockerSystemRoutes, { prefix: "/docker/system" })
  await fastify.register(containerRoutes, { prefix: "/docker/containers" })
  await fastify.register(imageRoutes, { prefix: "/docker/images" })
  await fastify.register(orchestrationRoutes, { prefix: "/docker/orchestration" })
  await fastify.register(registryRoutes, { prefix: "/registry" })
  await fastify.register(templateRoutes, { prefix: "/templates" })
  await fastify.register(portainerRoutes, { prefix: "/templates/portainer" })
  await fastify.register(systemRoutes, { prefix: "/server" })
  await fastify.register(proxyRoutes, { prefix: "/proxy" })
}

// Re-export individual blocks if explicit external picking is needed later
export { workspaceRoutes }
