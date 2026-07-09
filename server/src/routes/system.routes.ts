import { type FastifyPluginAsync } from "fastify"
import { Type } from "@sinclair/typebox"
import type { CpuCoreStatus } from "#/services/system/types.js"

export const systemRoutes: FastifyPluginAsync = async (fastify) => {
  const { systemMonitor } = fastify.dockside.services

  fastify.get(
    "/cores",
    {
      schema: {
        description: "Retrieve System CPU Core statistics",
        tags: ["server"],
        response: { 200: Type.Any() },
      },
    },
    () => systemMonitor.getSnapshot(),
  )
}
