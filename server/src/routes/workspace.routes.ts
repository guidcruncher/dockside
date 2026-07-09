import type { FastifyPluginAsync } from "fastify"
import { Type, type Static } from "@sinclair/typebox"
import { ComposeConfigSchema } from "#/services/compose/schemas.js"
import type { ComposeConfig } from "#/services/compose/types.js"
import { ComposeDependencyGraph } from "#/services/compose/composeDependencyGraph.js"

// ==========================================
// TypeBox Schema Definitions
// ==========================================

const ProjectSchema = Type.Object({
  projectName: Type.String(),
  configPath: Type.String(),
  folderPath: Type.String(),
  dsId: Type.String(),
  status: Type.Union([
    Type.Literal("unknown"),
    Type.Literal("running"),
    Type.Literal("syncing"),
    Type.Literal("stopped"),
    Type.Literal("error"),
  ]),
  isFavorite: Type.Boolean(),
  services: Type.Array(Type.Any()),
})

const WorkspaceStateSchema = Type.Object({
  rootPath: Type.Union([Type.String(), Type.Null()]),
  isLoading: Type.Boolean(),
  error: Type.Union([Type.String(), Type.Null()]),
  projects: Type.Record(Type.String(), ProjectSchema),
  lastSyncedAt: Type.Union([Type.String(), Type.Null()]),
})

const CreateProjectBody = Type.Object({
  projectName: Type.String({ minLength: 1 }),
  services: Type.Array(Type.Any()),
  config: ComposeConfigSchema,
})

const UpdateStatusBody = Type.Object({
  dsId: Type.String(),
  status: Type.Union([
    Type.Literal("unknown"),
    Type.Literal("running"),
    Type.Literal("stopped"),
    Type.Literal("error"),
  ]),
})

const ProjectParams = Type.Object({
  dsId: Type.String({ description: "The unique tracking ID assigned to the project stack" }),
})

// ==========================================
// Static Compilation Type Extraction
// ==========================================
type CreateProjectBodyType = Static<typeof CreateProjectBody>
type UpdateStatusBodyType = Static<typeof UpdateStatusBody>
type ProjectParamsType = Static<typeof ProjectParams>

// ==========================================
// Fastify Route Handler Plugin
// ==========================================

export const workspaceRoutes: FastifyPluginAsync = async (fastify) => {
  const { dockside } = fastify

  /**
   * GET /state
   * Retrieves the current, complete state of the workspace memory store.
   */
  fastify.get(
    "/state",
    {
      schema: {
        description: "Fetch the active workspace state parameters and tracked projects",
        tags: ["workspace"],
        response: { 200: WorkspaceStateSchema },
      },
    },
    async (request, reply) => {
      const state = dockside.services.persistentWorkspaceStore.getState()

      for (const dsId in state.projects) {
        const project = state.projects[dsId]
        if (!project) continue

        // 1. Source of truth: services defined in the project config
        const definedServices = project.services ?? []

        // 2. Get runtime containers for this project
        const containers = await dockside.services.dockerClientService.listProjectContainers(
          project.projectName,
        )

        // Build a lookup map: serviceName → container inspect result
        const containerMap: Record<string, any> = {}

        for (const container of containers) {
          const inspect = await dockside.services.dockerClientService.inspectContainer(container.Id)

          const name = container.Names?.[0]?.replace("/", "") ?? container.Id

          containerMap[name] = {
            state: inspect.State?.Status ?? "unknown",
            health: (inspect.State as any)?.Health?.Status ?? "none",
            image: container.Image,
          }
        }

        // 3. Merge defined services with runtime container info
        const mergedServices = definedServices.map((svc: any) => {
          const runtime = containerMap[svc.name]

          return {
            name: svc.name,
            image: runtime?.image ?? svc.image ?? null,
            state: runtime?.state ?? "stopped",
            health: runtime?.health ?? "none",
          }
        })

        // 4. Assign merged services back to project
        project.services = mergedServices
      }

      return {
        rootPath: state.rootPath,
        isLoading: state.isLoading,
        error: state.error,
        projects: state.projects,
        lastSyncedAt: state.lastSyncedAt?.toISOString() ?? null,
      }
    },
  )

  /**
   * POST /projects
   * Creates a new project structure on disk and updates memory states.
   */
  fastify.post<{ Body: CreateProjectBodyType }>(
    "/projects",
    {
      schema: {
        description: "Instantiate a new project folder layout and compose definitions on disk",
        tags: ["workspace"],
        body: CreateProjectBody,
        response: {
          200: Type.Object({ success: Type.Boolean(), dsId: Type.String() }),
          449: Type.Object({ message: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const { projectName, config, services } = request.body

      try {
        const dsId = await dockside.services.persistentWorkspaceStore.create(
          projectName,
          config as ComposeConfig,
          services,
        )

        reply.code(200)
        return { success: true, dsId }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Project initialization failed"
        throw reply.conflict(message)
      }
    },
  )

  /**
   * POST /projects/:dsId/favorite
   * Toggles the favorited state flags for a unique target project matched by its dsId.
   */
  fastify.post<{ Params: ProjectParamsType }>(
    "/projects/:dsId/favorite",
    {
      schema: {
        description:
          "Toggle the favorite flag status of a tracked compose project by its unique dsId identifier",
        tags: ["workspace"],
        params: ProjectParams,
        response: {
          200: Type.Object({ success: Type.Boolean() }),
          404: Type.Object({ message: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const { dsId } = request.params
      const matchedProject = dockside.services.persistentWorkspaceStore.find(dsId)

      if (matchedProject === undefined) {
        return reply.notFound(`No project tracking entry found matching dsId: ${dsId}`)
      }

      await dockside.services.persistentWorkspaceStore.toggleFavorite(matchedProject.folderPath)
      return { success: true }
    },
  )

  /**
   * PUT /projects/status
   * Manually modifies or pushes status updates to a target project row.
   */
  fastify.put<{ Body: UpdateStatusBodyType }>(
    "/projects/status",
    {
      schema: {
        description: "Update the operational health status configuration metric of a tracked stack",
        tags: ["workspace"],
        body: UpdateStatusBody,
        response: {
          200: Type.Object({ success: Type.Boolean() }),
          404: Type.Object({ message: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const { dsId, status } = request.body

      const matchedProject = dockside.services.persistentWorkspaceStore.find(dsId)

      if (matchedProject === undefined) {
        return reply.notFound(`No project tracking entry found matching dsId: ${dsId}`)
      }

      await dockside.services.persistentWorkspaceStore.updateProjectStatus(
        matchedProject.folderPath,
        status,
      )
      return { success: true }
    },
  )

  /**
   * GET /projects/:dsId/compose
   * Resolves a tracked project metadata row by its dsId and loads its parsed JSON configuration.
   */
  fastify.get<{ Params: ProjectParamsType }>(
    "/projects/:dsId/compose",
    {
      schema: {
        description: "Retrieve the fully parsed JSON configuration schema of a project by its dsId",
        tags: ["workspace"],
        params: ProjectParams,
        response: {
          200: Type.Any({ description: "The parsed ComposeConfig structure" }),
          404: Type.Object({ message: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const { dsId } = request.params
      const matchedProject = dockside.services.persistentWorkspaceStore.find(dsId)

      if (matchedProject === undefined) {
        return reply.notFound(`No project tracking entry found matching dsId: ${dsId}`)
      }

      // Read and map out the file content via the built-in workspace file pipeline
      const composeJson =
        await dockside.services.persistentWorkspaceStore.loadComposeJson(matchedProject)
      return composeJson
    },
  )

  /**
   * POST /projects/:dsId/compose/save
   * Forces a serialization write of the project's YAML configuration into a matching local .compose.json file.
   */
  fastify.post<{ Params: ProjectParamsType }>(
    "/projects/:dsId/compose/save",
    {
      schema: {
        description:
          "Trigger a compilation pass to regenerate and save the .compose.json local snapshot asset",
        tags: ["workspace"],
        params: ProjectParams,
        body: ComposeConfigSchema,
        response: {
          200: Type.Object({ success: Type.Boolean() }),
          404: Type.Object({ message: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const { dsId } = request.params
      const config: ComposeConfig = request.body as ComposeConfig
      const matchedProject = dockside.services.persistentWorkspaceStore.find(dsId)

      if (matchedProject === undefined) {
        return reply.notFound(`No project tracking entry found matching dsId: ${dsId}`)
      }

      await dockside.services.persistentWorkspaceStore.saveComposeJson(matchedProject, config)
      return { success: true }
    },
  )

  /**
   * GET /projects/:dsId/graph
   * Resolves a tracked project metadata row by its dsId and loads its dependency graph.
   */
  fastify.get<{ Params: ProjectParamsType }>(
    "/projects/:dsId/graph",
    {
      schema: {
        description: "Retrieve the Dependecy graph of a Project",
        tags: ["workspace"],
        params: ProjectParams,
      },
    },
    async (request, reply) => {
      const { dsId } = request.params
      const matchedProject = dockside.services.persistentWorkspaceStore.find(dsId)
      if (matchedProject === undefined) {
        return reply.notFound(`No project tracking entry found matching dsId: ${dsId}`)
      }

      const composeJson =
        await dockside.services.persistentWorkspaceStore.loadComposeJson(matchedProject)

      const graph = new ComposeDependencyGraph(composeJson)
      return graph.getResult()
    },
  )
}
