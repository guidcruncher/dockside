import { type FastifyPluginAsync } from "fastify"
import { Type } from "@sinclair/typebox"
import { ImageSummarySchema, ImageInspectResponseSchema } from "#/services/docker/schemas.js"

export const imageRoutes: FastifyPluginAsync = async (fastify) => {
  const { dockerClientService } = fastify.dockside.services

  fastify.get(
    "/",
    {
      schema: {
        description: "List all images currently stored in the Docker engine.",
        tags: ["images"],
        response: { 200: Type.Array(ImageSummarySchema) },
      },
    },
    () => dockerClientService.listImages(),
  )

  fastify.get(
    "/:name",
    {
      schema: {
        description: "Retrieve detailed metadata for a specific image.",
        tags: ["images"],
        params: Type.Object({ name: Type.String() }),
        response: { 200: ImageInspectResponseSchema },
      },
    },
    (req: any) => dockerClientService.inspectImage(req.params.name),
  )

  fastify.delete(
    "/:name",
    {
      schema: {
        description: "Remove an image from the Docker host.",
        tags: ["images"],
        params: Type.Object({ name: Type.String() }),
        querystring: Type.Object({ force: Type.Optional(Type.Boolean()) }),
        response: { 204: Type.Null() },
      },
    },
    (req: any) => dockerClientService.removeImage(req.params.name, req.query.force),
  )
}
