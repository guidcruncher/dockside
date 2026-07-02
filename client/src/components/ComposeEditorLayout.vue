<script setup lang="ts">
import { computed, watch, ref } from "vue"
import type { ComposeConfig, Service } from "@/types"
import { jsonClone } from "@/utils/clone"

const debug = ref<boolean>(true)

const props = defineProps<{
  modelValue: ComposeConfig
  service: Service
  onSelectService: (name: string) => void
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: ComposeConfig): void
}>()

const cfg = ref<ComposeConfig>(jsonClone(props.modelValue))
const lastPatch = ref<any>()
const selectedServiceName = ref<string | null>(null)

const availableServices = computed(() => {
  if (!cfg.value?.services) return []
  return Array.isArray(cfg.value.services)
    ? cfg.value.services.map((s: Service) => s.name)
    : Object.keys(cfg.value.services)
})

watch(
  () => props.service,
  (s) => {
    if (s?.name) {
      selectedServiceName.value = s.name
    }
  },
  { immediate: true },
)

function onSelectService(name: string) {
  selectedServiceName.value = name
  props.onSelectService(name)
}

function mergeService(name: string, patch: any) {
  cfg.value.services ??= {}

  if (Array.isArray(cfg.value.services)) {
    const idx = cfg.value.services.findIndex((s) => s.name === name)
    if (idx !== -1) {
      cfg.value.services[idx] = {
        ...cfg.value.services[idx],
        ...patch,
      }
    }
  } else {
    cfg.value.services[name] = {
      ...(cfg.value.services[name] ?? {}),
      ...patch,
    }
  }
}

function mergeGlobal(patch: any) {
  cfg.value = {
    ...cfg.value,
    ...patch,
  }
}

function applyPatch(payload: any) {
  if (!payload || typeof payload !== "object") return

  const { patchType, patch } = payload
  const name = selectedServiceName.value
  switch (patchType) {
    case "service":
      if (name) mergeService(name, patch)
      break

    case "global":
      mergeGlobal(patch)
      break

    case "full":
      cfg.value = jsonClone(patch)
      break
  }

  emit("update:modelValue", cfg.value)
}

function updateCompose(payload: any) {
  lastPatch.value = payload
  applyPatch(payload)
}

function patchCompose(patch: Partial<ComposeConfig>) {
  applyPatch({ patchType: "global", patch })
}

const activeTab = ref("basics")

const tabs = [
  { label: "Basics", value: "basics" },
  { label: "Build", value: "build" },
  { label: "Runtime", value: "runtime" },
  { label: "Networking", value: "networking" },
  { label: "Configs", value: "secretsconfigs" },
  { label: "Depends On", value: "dependson" },
  { label: "Deploy", value: "deploy" },
  { label: "Logging", value: "logging" },
  { label: "Advanced", value: "advanced" },
  { label: "Global", value: "global" },
  { label: "Yaml", value: "yaml" },
]
</script>

<template>
  <div class="flex w-full flex-col overflow-hidden bg-bg">
    <div class="flex min-h-0 flex-1 flex-col">
      <div class="min-w-0 w-full shrink-0 border-b border-border bg-surface">
        <GcTabStrip v-model="selectedServiceName">
          <GcTabStripItem
            v-for="svc in [
              ...(Array.isArray(cfg.services) ? cfg.services : Object.values(cfg.services ?? {})),
            ].sort((a, b) => a.name.localeCompare(b.name))"
            :key="svc.name"
            :name="svc.name"
            :label="svc.name"
            @click="onSelectService(svc.name)"
          />
        </GcTabStrip>
      </div>

      <div class="min-w-0 shrink-0 border-b border-border bg-surface overflow-x-auto">
        <GcTabStrip v-model="activeTab" class="w-full">
          <GcTabStripItem v-for="t in tabs" :key="t.value" :name="t.value" :label="t.label" />
        </GcTabStrip>
      </div>

      <div class="flex-1 w-full">
        <div class="mx-auto w-full max-w-full px-4 py-4 md:px-6 md:py-6">
          <ServiceBasicSection
            v-if="activeTab === 'basics'"
            :service="props.service"
            @update="updateCompose"
          />
          <ServiceBuildSection
            v-if="activeTab === 'build'"
            :service="props.service"
            @update="updateCompose"
          />
          <ServiceRuntimeSection
            v-if="activeTab === 'runtime'"
            :service="props.service"
            @update="updateCompose"
          />
          <ServiceHealthcheckSection
            v-if="activeTab === 'runtime'"
            :service="props.service"
            @update="updateCompose"
          />

          <ServiceNetworkingSection
            v-if="activeTab === 'networking'"
            :service="props.service"
            @update="updateCompose"
          />
          <ServiceDnsSection
            v-if="activeTab === 'networking'"
            :service="props.service"
            @update="updateCompose"
          />

          <ServiceSecretsConfigsSection
            v-if="activeTab === 'secretsconfigs'"
            :service="props.service"
            :available-services="availableServices"
            :available-configs="Object.keys(cfg.configs ?? {})"
            @update="updateCompose"
          />

          <ServiceDependsOnSection
            v-if="activeTab === 'dependson'"
            :service="props.service"
            :available-services="availableServices"
            @update="updateCompose"
          />

          <ServiceDeploySection
            v-if="activeTab === 'deploy'"
            :service="props.service"
            @update="updateCompose"
          />
          <ServiceLoggingSection
            v-if="activeTab === 'logging'"
            :service="props.service"
            @update="updateCompose"
          />
          <ServiceAdvancedSection
            v-if="activeTab === 'advanced'"
            :service="props.service"
            @update="updateCompose"
          />

          <GlobalNetworksSection
            v-if="activeTab === 'global'"
            :model-value="cfg.networks"
            @update:model-value="(v: any) => patchCompose({ networks: v })"
          />
          <GlobalVolumesSection
            v-if="activeTab === 'global'"
            :model-value="cfg.volumes"
            @update:model-value="(v: any) => patchCompose({ volumes: v })"
          />
          <GlobalSecretsSection
            v-if="activeTab === 'global'"
            :model-value="cfg.secrets"
            @update:model-value="(v: any) => patchCompose({ secrets: v })"
          />
          <GlobalConfigsSection
            v-if="activeTab === 'global'"
            :model-value="cfg.configs"
            @update:model-value="(v: any) => patchCompose({ configs: v })"
          />

          <LiveYamlEditor
            v-if="activeTab === 'yaml'"
            v-model="cfg"
            @update:modelValue="updateCompose"
          />
        </div>
      </div>
    </div>

    <div v-if="debug" class="border-b border-border p-2">
      Patch: {{ lastPatch }}
      <div style="height: 300px" class="overflow-scroll bg-muted-soft p-2">
        <pre>{{ cfg }}</pre>
      </div>
    </div>
  </div>
</template>
