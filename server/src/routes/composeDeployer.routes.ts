import type { FastifyPluginAsync } from "fastify"
import { Type, type Static } from "@sinclair/typebox"

// ==========================================
// TypeBox Schema Definitions
// ==========================================

const DeployParams = Type.Object({
  dsId: Type.String({
    description: "The unique workspace tracking ID of the project stack to deploy",
  }),
})

const DeploymentResultSchema = Type.Object({
  success: Type.Boolean(),
  deployedContainers: Type.Array(
    Type.Object({
      serviceName: Type.String(),
      containerId: Type.String(),
    }),
  ),
  errors: Type.Array(
    Type.Object({
      serviceName: Type.String(),
      message: Type.String(),
    }),
  ),
})

// ==========================================
// Static Compilation Type Extraction
// ==========================================
type DeployParamsType = Static<typeof DeployParams>

// ==========================================
// Fastify Route Handler Plugin
// ==========================================

export const composeDeployerRoutes: FastifyPluginAsync = async (fastify) => {
  const { dockside } = fastify

  /**
   * POST /projects/:dsId/deploy
   * Resolves a project by its tracking ID and triggers sequential deployment of its services.
   */
  fastify.post<{ Params: DeployParamsType }>(
    "/projects/:dsId/deploy",
    {
      schema: {
        description:
          "Fetch a managed project configuration by its tracking ID and orchestrate deployment to the Docker host",
        tags: ["orchestration"],
        params: DeployParams,
        response: {
          200: DeploymentResultSchema,
          404: Type.Object({ message: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const { dsId } = request.params

      // 1. Resolve target tracking metadata from the persistent store registry state
      const matchedProject = dockside.services.persistentWorkspaceStore.find(dsId)

      if (matchedProject === undefined) {
        throw reply.notFound(`No project tracking entry found matching dsId: ${dsId}`)
      }

      try {
        // 2. Read and parse the target configuration file contents from disk
        const composeConfig =
          await dockside.services.persistentWorkspaceStore.loadComposeJson(matchedProject)

        // 3. Delegate to the orchestrator service to purge stale threads and build the stack
        const deploymentReport = await dockside.services.composeDeployerService.deployStack(
          matchedProject,
          composeConfig,
        )

        return deploymentReport
      } catch (error) {
        // Enforce safe error propagation metrics using your @fastify/sensible utility patterns
        const message =
          error instanceof Error
            ? error.message
            : "Deployment execution encountered an internal failure"
        throw reply.internalServerError(message)
      }
    },
  )
}
