import { type FastifyPluginAsync } from "fastify"
import { Type } from "@sinclair/typebox"
import { ComposeLinkInfoSchema } from "#/services/docker/schemas.js"

export const orchestrationRoutes: FastifyPluginAsync = async (fastify) => {
  const { dockerClientService } = fastify.dockside.services

  fastify.get(
    "/compose-link",
    {
      schema: {
        description: "Resolve Docker Compose orchestration metadata for a specific container.",
        tags: ["orchestration"],
        querystring: Type.Object({ id: Type.String() }),
        response: {
          200: ComposeLinkInfoSchema,
          204: { type: "null", description: "No compose link info found for this container" },
        },
      },
    },
    (req: any) => dockerClientService.getComposeLink(req.query.id),
  )

  fastify.get(
    "/networks",
    {
      schema: {
        description: "List all networks managed by the Docker engine.",
        tags: ["orchestration"],
        response: { 200: Type.Array(Type.Any()) },
      },
    },
    () => dockerClientService.listNetworks(),
  )

  fastify.get(
    "/volumes",
    {
      schema: {
        description: "List all volumes currently available in the Docker environment.",
        tags: ["orchestration"],
        response: { 200: Type.Any() },
      },
    },
    () => dockerClientService.listVolumes(),
  )
}
