<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue"
import type { ComposeConfig } from "@/types"
import type { CreateProjectRequest } from "@/api"
import { gcUUID } from "@/utils/uuid"
import { useRouter } from "vue-router"
import { useComposeConfigNormalizer } from "../composables/useComposeConfigNormalizer"
import { useWorkspace } from "@/composables/useWorkspace"

const { normalizeComposeConfig } = useComposeConfigNormalizer()
const router = useRouter()
const { saveCompose, createProject } = useWorkspace()

const dirty = ref(false)
const composeConfig = ref<ComposeConfig | null>(null)
const projectRequest = ref<CreateProjectRequest | undefined>()
const selectedTemplateId = ref<string | number | undefined>()
const selectedTemplate = ref<any | undefined>()
const dsid = ref<string>(gcUUID())

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
async function saveComposeConfig(cfg: ComposeConfig) {
  return saveCompose(dsid.value, cfg)
}

// ---------------------------------------------------------
// LOAD / SAVE
// ---------------------------------------------------------

const getServices = (services: any): any[] => {
  if (!services) return []
  const res: any[] = []

  for (let key in services) {
    res.push({ name: services[key].name ?? key, image: services[key].image })
  }

  return res
}

async function save() {
  if (!composeConfig.value) return

  if (!projectRequest.value) {
    projectRequest.value = {
      projectName:
        selectedTemplate.value?._rawValue.title ?? selectedTemplate.value?._rawValue.name,
      services: getServices(composeConfig.value.services),
      config: composeConfig.value,
    }

    if (!projectRequest.value?.projectName) {
      projectRequest.value.projectName = dsid.value
    }

    const res = await createProject(projectRequest.value)
    if (res.success) {
      dsid.value = res.dsId
      //     router.push({ name: "ProjectView", params: { dsid: res.dsId } })
    }
  } else {
    await saveComposeConfig(composeConfig.value)
  }
  dirty.value = false
}

function cancel() {
  router.push({ name: "HomeView" })
}

function selectTemplate(opts: any) {
  composeConfig.value = normalizeComposeConfig(opts.config)
  selectedTemplate.value = opts.template
}

onMounted(() => {
  projectRequest.value = undefined
  composeConfig.value = null
  selectedTemplate.value = undefined
})
</script>

<template>
  <div class="p-1 s pace-y-3" v-if="!composeConfig">
    <PortainerTemplateBrowser v-model="selectedTemplateId" @select="selectTemplate" />
  </div>
  <div class="p-1 space-y-3" v-if="composeConfig">
    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Project: {{ dsid }}</h1>
      <div>
        <GcButton variant="primary" @click="save">Save</GcButton>
        &nbsp;
        <GcButton variant="primary" @click="cancel">Close</GcButton>
      </div>
    </div>
    <!-- MAIN EDITOR -->
    <ComposeEditorLayout
      :services="servicesArray"
      :service="selectedService"
      :onSelectService="onSelectService"
      v-model="composeConfig"
      @update:model-value="
        (v: ComposeConfig) => {
          composeConfig = v
          dirty = true
        }
      "
    />
  </div>
</template>
