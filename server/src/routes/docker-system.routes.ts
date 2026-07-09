import { type FastifyPluginAsync } from "fastify"
import { Type } from "@sinclair/typebox"
import {
  SystemVersionSchema,
  SystemInfoSchema,
  SystemDescriptorSchema,
} from "#/services/docker/schemas.js"

export const dockerSystemRoutes: FastifyPluginAsync = async (fastify) => {
  const { dockerClientService } = fastify.dockside.services

  fastify.get(
    "/version",
    {
      schema: {
        description: "Retrieve Docker Engine version and API versioning details.",
        tags: ["system"],
        response: { 200: SystemVersionSchema },
      },
    },
    () => dockerClientService.getVersion(),
  )

  fastify.get(
    "/info",
    {
      schema: {
        description: "Fetch comprehensive engine configuration, resource stats, and OS metadata.",
        tags: ["system"],
        response: { 200: SystemInfoSchema },
      },
    },
    () => dockerClientService.getInfo(),
  )

  fastify.get(
    "/descriptor",
    {
      schema: {
        description:
          "Get the standardized platform and architecture descriptor for deployment planning.",
        tags: ["system"],
        response: { 200: SystemDescriptorSchema },
      },
    },
    () => dockerClientService.getSystemDescriptor(),
  )

  fastify.post(
    "/prune",
    {
      schema: {
        description: "Prune unused build cache to reclaim disk space.",
        tags: ["system"],
        response: { 204: Type.Null() },
      },
    },
    async () => {
      await dockerClientService.buildCachePrune()
      return null
    },
  )
}
