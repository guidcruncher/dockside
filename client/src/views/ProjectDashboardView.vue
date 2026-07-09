<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"
import { useRoute } from "vue-router"
import { useWorkspace } from "@/composables/useWorkspace"
import type { WorkspaceProjectState } from "@/api"
import { RotateCcw, Square, Play, BookOpen } from "@lucide/vue"
import { useContainers } from "@/composables/useContainers"
import { useDependencyGraph } from "@/composables/useDependencyGraph"

interface ProjectWrapper {
  key: string
  value: WorkspaceProjectState
}

const route = useRoute()
const workspace = useWorkspace()
const containers = useContainers()

const dsid = route.params.dsid as string
let intervalHandle: number | null = null
const running = ref(false)
const dependencyGraph = useDependencyGraph()

const project = ref<ProjectWrapper | undefined>()

const projectValue = computed(() => {
  if (!project.value) return undefined
  const v = project.value.value as any
  v.derivedStatus = "unknown"

  if (v.services && v.services.length > 0) {
    if (v.services.some((s: any) => s.state === "error")) v.derivedStatus = "error"
    if (v.services.some((s: any) => s.state === "starting")) v.derivedStatus = "syncing"
    if (v.services.every((s: any) => s.state === "running")) v.derivedStatus = "running"
    if (v.services.every((s: any) => s.state === "stopped")) v.derivedStatus = "stopped"
  }

  return v
})

const startProject = async (proj: any) => {
  const graph = await dependencyGraph.load(proj.dsId)
  const services = graph.startupOrder
  for (let i = 0; i < services.length; i++) {
    await containers.start(services[i])
  }
}
const stopProject = async (proj: any) => {
  const graph = await dependencyGraph.load(proj.dsId)
  const services = graph.shutdownOrder
  for (let i = 0; i < services.length; i++) {
    await containers.stop(services[i])
  }
}
const restartProject = async (proj: any) => {
  await stopProject(proj)
  await startProject(proj)
}

onMounted(async () => {
  project.value = await workspace.getWorkspaceProject(dsid)
  dependencyGraph.dsId.value = dsid
  await dependencyGraph.refresh()
  intervalHandle = window.setInterval(async () => {
    if (running.value) return

    try {
      running.value = true
      workspace.refresh()
      project.value = await workspace.getWorkspaceProject(dsid)
    } finally {
      running.value = false
    }
  }, 5099)
})

onUnmounted(() => {
  if (intervalHandle !== null) {
    clearInterval(intervalHandle)
  }
})
</script>

<template>
  <div class="p-4 space-y-6">
    <GcCard>
      <div class="flex w-full items-center justify-between" v-if="projectValue">
        <div class="flex items-center">
          <h2>{{ projectValue.projectName }}</h2>
        </div>

        <div class="flex items-center gap-3">
          <GcButton
            @click="stopProject(projectValue)"
            variant="warning"
            v-if="projectValue.derivedStatus == 'running'"
            size="sm"
          >
            <Square class="w-5 h-5"
          /></GcButton>
          <GcButton @click="startProject(projectValue)" variant="success" v-else size="sm">
            <Play class="w-5 h-5"
          /></GcButton>

          <GcButton @click="restartProject(projectValue)" variant="primary" size="sm">
            <RotateCcw class="w-5 h-5"
          /></GcButton>

          <RouterLink :to="`/project/${projectValue.dsId}`">
            <GcButton variant="primary" size="sm"> <BookOpen class="w-5 h-5" /></GcButton>
          </RouterLink>
        </div>
      </div>
    </GcCard>

    <SystemMonitor />

    <ServiceStatusList v-if="project" :project="project" />
  </div>
</template>
