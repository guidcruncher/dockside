<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from "vue"
import { useWorkspace } from "@/composables/useWorkspace"

const props = withDefaults(
  defineProps<{
    refreshInterval?: number // seconds
  }>(),
  {
    refreshInterval: 5,
  },
)

let intervalHandle: number | null = null

const { state, loading, error, refresh, toggleFavorite } = useWorkspace()
const autoRefresh = ref(false)

onMounted(() => {
  refresh()

  if (props.refreshInterval > 0) {
    intervalHandle = window.setInterval(() => {
      autoRefresh.value = true
      refresh()
    }, props.refreshInterval * 1000)
  }
})

onUnmounted(() => {
  if (intervalHandle !== null) {
    clearInterval(intervalHandle)
  }
})

const onToggleFavorite = (dsId: string) => {
  toggleFavorite(dsId)
}

// Derive project-level status from service statuses
function computeProjectStatus(services: any[]) {
  if (!services || services.length === 0) return "unknown"

  if (services.some((s) => s.state === "error")) return "error"
  if (services.some((s) => s.state === "starting")) return "syncing"
  if (services.every((s) => s.state === "running")) return "running"
  if (services.every((s) => s.state === "stopped")) return "stopped"

  return "unknown"
}

const projectList = computed(() => {
  if (!state?.value) return []
  return Object.values(state.value.projects).map((project) => ({
    ...project,
    derivedStatus: computeProjectStatus(project.services),
  }))
})
</script>

<template>
  <div class="space-y-4">
    <!-- Loading -->
    <GcSpinner v-if="loading && !autoRefresh" label="Loading projects…" />

    <!-- Error -->
    <GcError v-if="error" :message="error" />

    <!-- Empty -->
    <GcEmptyState
      v-if="!loading && projectList.length === 0"
      title="No projects yet"
      description="Create your first project to get started."
      icon="folder"
    />

    <!-- Project List -->
    <div v-if="projectList.length > 0" class="space-y-4">
      <div
        v-for="project in projectList"
        :key="project.dsId"
        class="rounded-md border border-border/60 overflow-hidden"
      >
        <GcCard class="w-full flex flex-col gap-4 p-4">
          <!-- Header Row -->
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-lg">
                  {{ project.projectName }}
                </span>

                <!-- Project-level status -->
                <GcBadge
                  :variant="
                    {
                      running: 'success',
                      syncing: 'warning',
                      stopped: 'neutral',
                      error: 'danger',
                      unknown: 'secondary',
                    }[project.derivedStatus]
                  "
                >
                  {{ project.derivedStatus }}
                </GcBadge>
              </div>

              <span class="text-sm text-gray-500">
                {{ project.folderPath }}
              </span>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-3">
              <GcButton
                variant="ghost"
                size="sm"
                :icon="project.isFavorite ? 'star-filled' : 'star'"
                @click="onToggleFavorite(project.dsId)"
              />

              <RouterLink :to="`/project/${project.dsId}`">
                <GcButton variant="primary" size="sm" icon="arrow-right"> Open </GcButton>
              </RouterLink>
            </div>
          </div>

          <!-- Services List -->
          <div class="border-t border-border/60 pt-3 space-y-2">
            <div
              v-for="service in project.services"
              :key="service.name"
              class="flex items-center justify-between"
            >
              <div class="flex flex-col">
                <span class="font-medium">{{ service.name }}</span>
                <span class="text-xs text-gray-500">
                  {{ service.image }}
                </span>
              </div>

              <div class="flex items-center gap-2">
                <!-- Service state -->
                <GcBadge
                  :variant="
                    {
                      running: 'success',
                      starting: 'warning',
                      stopped: 'neutral',
                      error: 'danger',
                      unknown: 'secondary',
                    }[service.state]
                  "
                >
                  {{ service.state }}
                </GcBadge>

                <!-- Health badge -->
                <GcBadge
                  :variant="
                    {
                      healthy: 'success',
                      unhealthy: 'danger',
                      starting: 'warning',
                      none: 'secondary',
                    }[service.health]
                  "
                >
                  {{ service.health }}
                </GcBadge>
              </div>
            </div>
          </div>
        </GcCard>
      </div>
    </div>
  </div>
</template>
