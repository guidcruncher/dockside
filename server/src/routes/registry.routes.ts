// src/api/registryApiPlugin.ts
import type { FastifyInstance, FastifyPluginAsync } from "fastify"
import { Type } from "@sinclair/typebox"

import {
  UpdateCheckResultSchema,
  RemoteManifestResultSchema,
  RepositoryMetadataSchema,
} from "../services/registry/schemas.js"

export const registryRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const { manifestService, metadataService, updateCheckerService } = fastify.dockside.services

  // -----------------------------------------------------
  // GET /registry/manifest/:imageRef
  // -----------------------------------------------------
  fastify.route({
    method: "GET",
    url: "/registry/manifest/:imageRef",
    schema: {
      summary: "Fetch remote manifest for an image reference",
      tags: ["registry"],
      params: Type.Object({
        imageRef: Type.String(),
      }),
      response: {
        200: Type.Object({
          ok: Type.Boolean(),
          manifest: RemoteManifestResultSchema,
        }),
        400: Type.Object({
          ok: Type.Boolean(),
          error: Type.String(),
        }),
      },
    },
    handler: async (req, reply) => {
      const { imageRef } = req.params as { imageRef: string }

      try {
        const manifest = await manifestService.getRemoteManifestFromImage(imageRef)

        return reply.send({
          ok: true,
          manifest,
        })
      } catch (err: any) {
        return reply.status(400).send({
          ok: false,
          error: err.message,
        })
      }
    },
  })

  // -----------------------------------------------------
  // GET /registry/metadata/:imageRef
  // -----------------------------------------------------
  fastify.route({
    method: "GET",
    url: "/registry/metadata/:imageRef",
    schema: {
      summary: "Fetch repository metadata for an image reference",
      tags: ["registry"],
      params: Type.Object({
        imageRef: Type.String(),
      }),
      response: {
        200: Type.Object({
          ok: Type.Boolean(),
          metadata: RepositoryMetadataSchema,
        }),
        400: Type.Object({
          ok: Type.Boolean(),
          error: Type.String(),
        }),
      },
    },
    handler: async (req, reply) => {
      const { imageRef } = req.params as { imageRef: string }

      try {
        const metadata = await metadataService.fromImage(imageRef)

        return reply.send({
          ok: true,
          metadata: metadata.metadata,
        })
      } catch (err: any) {
        return reply.status(400).send({
          ok: false,
          error: err.message,
        })
      }
    },
  })

  // -----------------------------------------------------
  // GET /registry/info/:imageRef
  // -----------------------------------------------------
  fastify.route({
    method: "GET",
    url: "/registry/info/:imageRef",
    schema: {
      summary: "Fetch both manifest and metadata for an image reference",
      tags: ["registry"],
      params: Type.Object({
        imageRef: Type.String(),
      }),
      response: {
        200: Type.Object({
          ok: Type.Boolean(),
          manifest: RemoteManifestResultSchema,
          metadata: Type.Optional(RepositoryMetadataSchema),
          tags: Type.Optional(Type.Array(Type.String())),
        }),
        400: Type.Object({
          ok: Type.Boolean(),
          error: Type.String(),
        }),
      },
    },
    handler: async (req, reply) => {
      const { imageRef } = req.params as { imageRef: string }
      let metadata: any = {}

      try {
        metadata = await metadataService.fromImage(imageRef)
      } catch {
        metadata = undefined
        //NOOP
      }

      try {
        const [manifest, tags] = await Promise.all([
          manifestService.getRemoteManifestFromImage(imageRef),
          manifestService.getTagList(imageRef),
        ])

        return reply.send({
          ok: true,
          manifest,
          metadata: metadata.metadata,
          tags: tags,
        })
      } catch (err: any) {
        return reply.status(400).send({
          ok: false,
          error: err.message,
        })
      }
    },
  })

  // -----------------------------------------------------
  // GET /registry/tags/:imageRef
  // -----------------------------------------------------
  fastify.route({
    method: "GET",
    url: "/registry/tags/:imageRef",
    schema: {
      summary: "Fetch image reference tags",
      tags: ["registry"],
      params: Type.Object({
        imageRef: Type.String(),
      }),
      response: {
        200: Type.Array(Type.String()),
        400: Type.Object({
          ok: Type.Boolean(),
          error: Type.String(),
        }),
      },
    },
    handler: async (req, reply) => {
      const { imageRef } = req.params as { imageRef: string }
      try {
        const tags = await manifestService.getTagList(imageRef)
        return reply.send(tags)
      } catch (err: any) {
        return reply.status(400).send({
          ok: false,
          error: err.message,
        })
      }
    },
  })

  fastify.route({
    method: "GET",
    url: "/update/:imageRef",

    schema: {
      summary: "Checks for updates on the remote registry for a given image reference",
      tags: ["registry"],
      params: Type.Object({
        imageRef: Type.String(),
      }),
      response: {
        200: UpdateCheckResultSchema,
        400: Type.Object({
          ok: Type.Boolean(),
          error: Type.String(),
        }),
      },
    },

    handler: async (req, reply) => {
      const { imageRef } = req.params as { imageRef: string }

      // Decode URL-encoded image reference
      const decoded = decodeURIComponent(imageRef)

      try {
        // Perform update check
        const result = await updateCheckerService.checkForUpdate(decoded)

        return reply.send(result)
      } catch (err: any) {
        return reply.status(400).send({
          ok: false,
          error: err.message,
        })
      }
    },
  })
}
