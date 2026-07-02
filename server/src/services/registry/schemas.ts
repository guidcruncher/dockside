import { Type, type Static } from "@sinclair/typebox"

// -------------------------------------------------------------
// LocalImageInspect
// -------------------------------------------------------------
export const LocalImageInspectSchema = Type.Object({
  Architecture: Type.String(),
  Os: Type.String(),
  Variant: Type.Union([Type.String(), Type.Null()]),
  RepoDigests: Type.Array(Type.String()),
})

export type LocalImageInspectType = Static<typeof LocalImageInspectSchema>

// -------------------------------------------------------------
// Descriptor
// -------------------------------------------------------------
export const DescriptorSchema = Type.Object({
  mediaType: Type.String(),
  digest: Type.String(),
  size: Type.Number(),

  urls: Type.Optional(Type.Array(Type.String())),
  annotations: Type.Optional(Type.Record(Type.String(), Type.String())),

  platform: Type.Optional(
    Type.Object({
      architecture: Type.String(),
      os: Type.String(),
      variant: Type.Optional(Type.String()),
      features: Type.Optional(Type.Array(Type.String())),
    }),
  ),
})

export type DescriptorType = Static<typeof DescriptorSchema>

// -------------------------------------------------------------
// OCI Image Index (multi-arch)
// -------------------------------------------------------------
export const OCIImageIndexSchema = Type.Object({
  schemaVersion: Type.Literal(2),
  mediaType: Type.Literal("application/vnd.oci.image.index.v1+json"),

  manifests: Type.Array(DescriptorSchema),

  annotations: Type.Optional(Type.Record(Type.String(), Type.String())),
  artifactType: Type.Optional(Type.String()),
  subject: Type.Optional(DescriptorSchema),
})

export type OCIImageIndexType = Static<typeof OCIImageIndexSchema>

// -------------------------------------------------------------
// Docker Manifest List (multi-arch)
// -------------------------------------------------------------
export const DockerManifestListSchema = Type.Object({
  schemaVersion: Type.Literal(2),
  mediaType: Type.Literal("application/vnd.docker.distribution.manifest.list.v2+json"),

  manifests: Type.Array(DescriptorSchema),

  annotations: Type.Optional(Type.Record(Type.String(), Type.String())),
})

export type DockerManifestListType = Static<typeof DockerManifestListSchema>

// -------------------------------------------------------------
// ManifestList union
// -------------------------------------------------------------
export const ManifestListSchema = Type.Union([OCIImageIndexSchema, DockerManifestListSchema])

export type ManifestListType = Static<typeof ManifestListSchema>

// -------------------------------------------------------------
// OCI Image Manifest (single-arch)
// -------------------------------------------------------------
export const OCIImageManifestSchema = Type.Object({
  schemaVersion: Type.Literal(2),
  mediaType: Type.Literal("application/vnd.oci.image.manifest.v1+json"),

  config: DescriptorSchema,
  layers: Type.Array(DescriptorSchema),

  annotations: Type.Optional(Type.Record(Type.String(), Type.String())),
  artifactType: Type.Optional(Type.String()),
  subject: Type.Optional(DescriptorSchema),
})

export type OCIImageManifestType = Static<typeof OCIImageManifestSchema>

// -------------------------------------------------------------
// Docker Image Manifest (single-arch)
// -------------------------------------------------------------
export const DockerImageManifestSchema = Type.Object({
  schemaVersion: Type.Literal(2),
  mediaType: Type.Literal("application/vnd.docker.distribution.manifest.v2+json"),

  config: DescriptorSchema,
  layers: Type.Array(DescriptorSchema),

  annotations: Type.Optional(Type.Record(Type.String(), Type.String())),
})

export type DockerImageManifestType = Static<typeof DockerImageManifestSchema>

// -------------------------------------------------------------
// ImageManifest union
// -------------------------------------------------------------
export const ImageManifestSchema = Type.Union([OCIImageManifestSchema, DockerImageManifestSchema])

export type ImageManifestType = Static<typeof ImageManifestSchema>

// -------------------------------------------------------------
// RegistryAuthToken
// -------------------------------------------------------------
export const RegistryAuthTokenSchema = Type.Object({
  token: Type.String(),
})

export type RegistryAuthTokenType = Static<typeof RegistryAuthTokenSchema>

// -------------------------------------------------------------
// RemoteManifestResult
// -------------------------------------------------------------
export const RemoteManifestResultSchema = Type.Object({
  registry: Type.String(),
  repository: Type.String(),
  reference: Type.String(),

  raw: Type.Union([ImageManifestSchema, ManifestListSchema]),
  mediaType: Type.String(),

  isManifestList: Type.Boolean(),
  isImageManifest: Type.Boolean(),

  manifestList: Type.Union([ManifestListSchema, Type.Null()]),
  imageManifest: Type.Union([ImageManifestSchema, Type.Null()]),

  configDigest: Type.Union([Type.String(), Type.Null()]),
  layerDigests: Type.Array(Type.String()),

  // toString() is runtime-only, not part of schema
})

export type RemoteManifestResultType = Static<typeof RemoteManifestResultSchema>

// -------------------------------------------------------------
// RepositoryMetadata
// -------------------------------------------------------------
export const RepositoryMetadataSchema = Type.Object({
  name: Type.Optional(Type.String()),
  description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  lastUpdated: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  pulls: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  stars: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  tags: Type.Optional(Type.Union([Type.Array(Type.String()), Type.Null()])),
  raw: Type.Optional(Type.Unknown()),
})

export type RepositoryMetadataType = Static<typeof RepositoryMetadataSchema>

// ---------------------------------------------
// PlatformMatch
// ---------------------------------------------
export const PlatformMatchSchema = Type.Object({
  architecture: Type.String(),
  os: Type.String(),
  variant: Type.Union([Type.String(), Type.Null()], { default: null }),
})

// ---------------------------------------------
// UpdateCheckResult
// ---------------------------------------------
export const UpdateCheckResultSchema = Type.Object({
  updateAvailable: Type.Boolean(),
  localDigest: Type.Union([Type.String(), Type.Null()]),
  remoteDigest: Type.Union([Type.String(), Type.Null()]),
  platform: PlatformMatchSchema,

  matchedDescriptor: Type.Optional(
    Type.Object({
      digest: Type.String(),
      mediaType: Type.String(),
    }),
  ),
})
