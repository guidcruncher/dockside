import { type FastifyPluginAsync } from "fastify"
import { Type } from "@sinclair/typebox"
import {
  ContainerSummaryResponseSchema,
  ContainerInspectResponseSchema,
} from "#/services/docker/schemas.js"

export const containerRoutes: FastifyPluginAsync = async (fastify) => {
  const { dockerClientService } = fastify.dockside.services

  fastify.get(
    "/",
    {
      schema: {
        description: "Retrieve a list of all containers managed by the daemon.",
        tags: ["containers"],
        querystring: Type.Object({ all: Type.Optional(Type.Boolean()) }),
        response: { 200: Type.Array(ContainerSummaryResponseSchema) },
      },
    },
    (req: any) => dockerClientService.listContainers(req.query.all ?? true),
  )

  fastify.get(
    "/:id",
    {
      schema: {
        description: "Inspect specific container configuration details.",
        tags: ["containers"],
        params: Type.Object({ id: Type.String() }),
        response: { 200: ContainerInspectResponseSchema },
      },
    },
    (req: any) => dockerClientService.inspectContainer(req.params.id),
  )

  fastify.post(
    "/:id/start",
    {
      schema: {
        description: "Start a previously created container.",
        tags: ["containers"],
        params: Type.Object({ id: Type.String() }),
        response: { 204: Type.Null() },
      },
    },
    (req: any) => dockerClientService.startContainer(req.params.id),
  )

  fastify.post(
    "/:id/stop",
    {
      schema: {
        description: "Stop a running container.",
        tags: ["containers"],
        params: Type.Object({ id: Type.String() }),
        querystring: Type.Object({ timeout: Type.Optional(Type.Integer()) }),
        response: { 204: Type.Null() },
      },
    },
    (req: any) => dockerClientService.stopContainer(req.params.id, req.query.timeout),
  )

  fastify.post(
    "/:id/restart",
    {
      schema: {
        description: "Stop and starts (Reatarts) a running container.",
        tags: ["containers"],
        params: Type.Object({ id: Type.String() }),
        querystring: Type.Object({ timeout: Type.Optional(Type.Integer()) }),
        response: { 204: Type.Null() },
      },
    },
    (req: any) => dockerClientService.restartContainer(req.params.id, req.query.timeout),
  )

  fastify.delete(
    "/:id",
    {
      schema: {
        description: "Remove a container from the host engine.",
        tags: ["containers"],
        params: Type.Object({ id: Type.String() }),
        querystring: Type.Object({
          force: Type.Optional(Type.Boolean()),
          volumes: Type.Optional(Type.Boolean()),
        }),
        response: { 204: Type.Null() },
      },
    },
    (req: any) => dockerClientService.removeContainer(req.params.id, req.query),
  )

  fastify.get(
    "/:id/logs",
    {
      schema: {
        description: "Stream logs from a container instance.",
        tags: ["containers"],
        params: Type.Object({ id: Type.String() }),
        produces: ["text/plain"],
        response: { 200: Type.String() },
      },
    },
    (req: any, reply) => reply.send(dockerClientService.getContainerLogs(req.params.id)),
  )
}
