import { DockerFolderScanner } from "#/services/compose/composeFolderScanner.js"
import { PersistentWorkspaceStore } from "#/store/workspaceStore.js"
import { DockerClientService } from "#/services/docker/dockerClientService.js"
import { ComposeTranslator } from "#/services/docker/composeTranslator.js"
import { ClientFactory } from "#/services/docker/clients/clientFactory.js"
import type { DockerClientConfig, Config } from "#/config/types.js"
import { loadConfig } from "#/config/loader.js"
import { ComposeDeployerService } from "#/services/docker/composeDeployerService.js"
import fp from "fastify-plugin"
import { ManifestService } from "#/services/registry/manifestService.js"
import { RegistryClientService } from "#/services/registry/registryClientService.js"
import { MetadataService } from "#/services/registry/metadataService.js"
import { UpdateCheckerService } from "#/services/registry/updateCheckerService.js"
import { TemplateStore, runTemplateSync } from "#/services/templates/templateStore.js"

export const diPlugin = fp(async (fastify) => {
  const config: Config = loadConfig()
  const dockerFolderScanner = new DockerFolderScanner(config.workspace.folder)
  const persistentWorkspaceStore = new PersistentWorkspaceStore(dockerFolderScanner)
  const clientFactory = new ClientFactory()
  let dockerClientService: DockerClientService

  if (config.clientopts) {
    const opts: DockerClientConfig = config.clientopts as DockerClientConfig
    dockerClientService = new DockerClientService(clientFactory.create(opts.type, opts))
  } else {
    dockerClientService = new DockerClientService(clientFactory.create())
  }

  const composeTranslator = new ComposeTranslator()
  const system = await dockerClientService.getSystemDescriptor()
  const composeDeployerService = new ComposeDeployerService(dockerClientService, system)
  const registryClientService = new RegistryClientService()
  const manifestService = new ManifestService(config, dockerClientService, registryClientService)
  const metadataService = new MetadataService(config)
  const updateCheckerService = new UpdateCheckerService(dockerClientService, manifestService)
  const templateStore = new TemplateStore(config.templates.folder)

  await persistentWorkspaceStore.setWorkspaceRoot()
  await runTemplateSync(templateStore)

  fastify.decorate("dockside", {
    config: config,
    system: system,
    services: {
      dockerFolderScanner,
      persistentWorkspaceStore,
      dockerClientService,
      composeTranslator,
      composeDeployerService,
      clientFactory,
      registryClientService,
      manifestService,
      metadataService,
      updateCheckerService,
      templateStore,
    },
  })
})
