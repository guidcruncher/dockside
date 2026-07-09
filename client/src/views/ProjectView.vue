<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import type { ComposeConfig } from "@/types"
import type { ProxyConfig } from "@/api"

import { useComposeConfigNormalizer } from "../composables/useComposeConfigNormalizer"
import { useWorkspace } from "@/composables/useWorkspace"
import { useProxy } from "@/composables/useProxy"

const { normalizeComposeConfig } = useComposeConfigNormalizer()
const route = useRoute()
const router = useRouter()
const workspace = useWorkspace()
const proxy = useProxy()
const proxyConfig = ref<ProxyConfig | undefined>()

const dsid = route.params.dsid as string

// ---------------------------------------------------------
// STATE
// ---------------------------------------------------------
const loading = ref(true)
const error = ref<string | null>(null)
const composeConfig = ref<ComposeConfig | null>(null)
const dirty = ref(false)

// ---------------------------------------------------------
// ALWAYS-SAFE COMPOSE OBJECT
// ---------------------------------------------------------
const safeCompose = computed<ComposeConfig>(() => {
  return (
    composeConfig.value ??
    normalizeComposeConfig({
      name: "",
      version: "3.9",
      services: {},
      networks: {},
      volumes: {},
      secrets: {},
      configs: {},
    })
  )
})

// ---------------------------------------------------------
// SERVICES LIST + ARRAY
// ---------------------------------------------------------
const servicesList = computed(() => safeCompose.value.services ?? {})

const servicesArray = computed(() =>
  Object.entries(servicesList.value).map(([_name, svc]) => ({
    ...svc,
  })),
)

// ---------------------------------------------------------
// SERVICE SELECTION
// ---------------------------------------------------------
const selectedServiceName = ref<string | null>(null)

const firstServiceName = computed(() => {
  const keys = Object.keys(servicesList.value)
  return keys.length ? keys[0] : null
})

const selectedService = computed(() => {
  const name = selectedServiceName.value ?? firstServiceName.value
  return name ? servicesList.value[name] : null
})

// Reset selection when services change
watch(
  () => Object.keys(servicesList.value),
  () => {
    if (!selectedServiceName.value || !servicesList.value[selectedServiceName.value]) {
      selectedServiceName.value = firstServiceName.value
    }
  },
)

function onSelectService(name: string) {
  selectedServiceName.value = name
}

// ---------------------------------------------------------
// API
// ---------------------------------------------------------
async function fetchComposeConfig(dsid: string): Promise<ComposeConfig> {
  return workspace.getCompose(dsid)
}

async function fetchProxy(dsid: string): Promise<ProxyConfig | undefined> {
  const proj = await workspace.getWorkspaceProject(dsid)

  if (!proj) return

  return proxy.getConfig(proj.value)
}

async function saveProxyConfig(dsid: string, cfg: ProxyConfig) {
  const proj = await workspace.getWorkspaceProject(dsid)
  if (!proj) return

  proxy.config.value = cfg
  return proxy.updateConfig()
}

async function saveComposeConfig(dsid: string, cfg: ComposeConfig) {
  return workspace.saveCompose(dsid, cfg)
}

// ---------------------------------------------------------
// LOAD / SAVE
// ---------------------------------------------------------
async function load() {
  loading.value = true
  error.value = null

  try {
    const raw = await fetchComposeConfig(dsid)
    proxyConfig.value = await fetchProxy(dsid)
    composeConfig.value = normalizeComposeConfig(raw)
    dirty.value = false
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function save() {
  if (!composeConfig.value) return
  await saveComposeConfig(dsid, composeConfig.value)
  if (proxyConfig.value) {
    await saveProxyConfig(dsid, proxyConfig.value)
  }
  dirty.value = false
}

function cancel() {
  router.push({ name: "HomeView" })
}

onMounted(load)
</script>

<template>
  <div class="p-1 space-y-3">
    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Project: {{ dsid }}</h1>

      <div>
        <GcButton variant="primary" @click="save">Save</GcButton>
        &nbsp;
        <GcButton variant="primary" @click="cancel">Close</GcButton>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="flex justify-center py-20">
      <GcSpinner size="lg" />
    </div>

    <!-- ERROR -->
    <GcCard v-else-if="error" padding="p-4 space-y-4">
      <p class="text-red-500 font-medium">Error loading project</p>
      <p class="text-sm opacity-80">{{ error }}</p>

      <GcButton variant="primary" @click="load">Retry</GcButton>
    </GcCard>

    <!-- MAIN EDITOR -->
    <ComposeEditorLayout
      v-else
      :services="servicesArray"
      :service="selectedService"
      :onSelectService="onSelectService"
      v-model="composeConfig"
      :proxy="proxyConfig"
      @update:model-value="
        (v: ComposeConfig) => {
          composeConfig = v
          dirty = true
        }
      "
    />
  </div>
</template>
