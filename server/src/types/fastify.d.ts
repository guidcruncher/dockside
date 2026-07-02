import { DockerFolderScanner } from "#/services/compose/composeFolderScanner.js"
import { PersistentWorkspaceStore } from "#/store/workspaceStore.js"
import { DockerClientService } from "#/services/docker/dockerClientService.js"
import { ComposeTranslator } from "#/services/docker/composeTranslator.js"
import { ClientFactory } from "#/services/docker/clients/clientFactory.js"
import type { Config } from "#/config/types.js"
import { loadConfig } from "#/config/loader.js"
import { ComposeDeployerService } from "#/services/docker/composeDeployerService.js"
import type { SystemDescriptor } from "#/services/docker/types.js"
import { ManifestService } from "#/services/registry/manifestService.js"
import { RegistryClientService } from "#/services/registry/registryClientService.js"
import { MetadataService } from "#/services/registry/metadataService.js"
import { UpdateCheckerService } from "#/services/registry/updateCheckerService.js"
import { TemplateStore } from "#/services/templates/templateStore.js"

// Module Augmentation to inject types directly into Fastify's core interface
declare module "fastify" {
  interface FastifyInstance {
    dockside: {
      config: Config
      system: SystemDescriptor
      services: {
        dockerFolderScanner: DockerFolderScanner
        persistentWorkspaceStore: PersistentWorkspaceStore
        dockerClientService: DockerClientService
        composeTranslator: ComposeTranslator
        clientFactory: ClientFactory
        composeDeployerService: ComposeDeployerService
        registryClientService: RegistryClientService
        manifestService: ManifestService
        metadataService: MetadataService
        updateCheckerService: UpdateCheckerService
        templateStore: TemplateStore
      }
    }
  }
}
