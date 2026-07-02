import type { IncomingMessage } from "node:http"
import { ComposeTranslator } from "./composeTranslator.js"
import type { DockerClientService } from "./dockerClientService.js"
import type { ComposeConfig } from "#/services/compose/types.js"
import type { ManagedProject } from "../../store/types.js"
import type { SystemDescriptor } from "./types.js"

const ociImageLabels = [
  "org.opencontainers.image.created",
  "org.opencontainers.image.description",
  "org.opencontainers.image.licenses",
  "org.opencontainers.image.revision",
  "org.opencontainers.image.source",
  "org.opencontainers.image.title",
  "org.opencontainers.image.url",
  "org.opencontainers.image.version",
]

export interface DeploymentResult {
  success: boolean
  deployedContainers: Array<{
    serviceName: string
    containerId: string
  }>
  errors: Array<{
    serviceName: string
    message: string
  }>
}

export class ComposeDeployerService {
  constructor(
    private readonly dockerClient: DockerClientService,
    private readonly sys: SystemDescriptor,
  ) {}

  /**
   * Orchestrates the parsing, sanitization, and deployment of a full multi-container stack.
   * @param project ManagedProject configuration.
   * @param config Fully loaded ComposeConfig configuration schema tree.
   * @param opts Deployment options.
   */
  public async deployStack(
    project: ManagedProject,
    config: ComposeConfig,
    opts: any = {},
  ): Promise<DeploymentResult> {
    const result: DeploymentResult = {
      success: true,
      deployedContainers: [],
      errors: [],
    }

    if (!config.services || Object.keys(config.services).length === 0) {
      return { ...result, success: false }
    }

    const activeContainers = await this.dockerClient.listContainers(true)

    for (const [serviceName, serviceDef] of Object.entries(config.services)) {
      if (!serviceDef) continue

      const targetContainerName = `dockside-${project.dsId}-${serviceName}`

      try {
        // 1. Ensure image is pulled locally
        const pullStream = await this.dockerClient.pullImage(serviceDef.image, this.sys.Platform)
        await new Promise<void>((resolve, reject) => {
          pullStream.on("end", resolve)
          pullStream.on("error", reject)
          pullStream.on("data", () => {})
        })

        // 2. Extract OCI labels from local image
        const imageMetadata = await this.dockerClient.inspectImage(serviceDef.image)
        const extractedLabels: Record<string, string> = {}

        if (imageMetadata?.Config?.Labels) {
          for (const labelKey of ociImageLabels) {
            const val = imageMetadata.Config.Labels[labelKey]
            if (val !== undefined) {
              extractedLabels[labelKey] = val
            }
          }
        }

        // 3. Purge existing container
        const legacyContainer = activeContainers.find((container) =>
          container.Names.some(
            (name) => name === `/${targetContainerName}` || name === targetContainerName,
          ),
        )

        if (legacyContainer) {
          await this.dockerClient.removeContainer(legacyContainer.Id, {
            force: true,
            volumes: true,
          })
        }

        // 4. Translate definition and merge extracted OCI labels
        const engineConfig = ComposeTranslator.translate(project.dsId, serviceDef)

        engineConfig.Labels = {
          ...engineConfig.Labels,
          ...extractedLabels,
        }

        // 5. Invoke creation
        const creationResponse = await this.dockerClient.createContainer(
          project,
          targetContainerName,
          engineConfig,
        )

        if (opts.start) {
          await this.dockerClient.startContainer(creationResponse.Id)
        }

        result.deployedContainers.push({
          serviceName,
          containerId: creationResponse.Id,
        })
      } catch (error) {
        result.success = false
        result.errors.push({
          serviceName,
          message: error instanceof Error ? error.message : "Internal engine deployment failure",
        })
      }
    }

    return result
  }
}
