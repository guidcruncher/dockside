<script setup lang="ts">
import { onMounted } from "vue"
import { useWorkspace } from "@/composables/useWorkspace"

const { state, loading, error, refresh, toggleFavorite } = useWorkspace()

onMounted(refresh)

function onToggleFavorite(dsId: string) {
  toggleFavorite(dsId)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Loading -->
    <GcSpinner v-if="loading" label="Loading projects…" />

    <!-- Error -->
    <GcError v-if="error" :message="error" />

    <!-- Empty -->
    <GcEmptyState
      v-if="!loading && state && Object.keys(state.projects).length === 0"
      title="No projects yet"
      description="Create your first project to get started."
      icon="folder"
    />

    <!-- Project List -->
    <GcList v-if="state">
      <GcListItem v-for="project in state.projects" :key="project.dsId">
        <GcCard class="w-full flex items-center justify-between">
          <!-- Left side -->
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-lg">
                {{ project.projectName }}
              </span>

              <!-- Status badge -->
              <GcBadge
                :variant="
                  {
                    running: 'success',
                    syncing: 'warning',
                    stopped: 'neutral',
                    error: 'danger',
                    unknown: 'secondary',
                  }[project.status]
                "
              >
                {{ project.status }}
              </GcBadge>
            </div>

            <span class="text-sm text-gray-500">
              {{ project.folderPath }}
            </span>
          </div>

          <!-- Right side actions -->
          <div class="flex items-center gap-3">
            <!-- Favorite toggle -->
            <GcButton
              variant="ghost"
              size="sm"
              :icon="project.isFavorite ? 'star-filled' : 'star'"
              @click="onToggleFavorite(project.dsId)"
            />

            <!-- Open -->
            <RouterLink :to="`/projects/${project.dsId}`">
              <GcButton variant="primary" size="sm" icon="arrow-right"> Open </GcButton>
            </RouterLink>
          </div>
        </GcCard>
      </GcListItem>
    </GcList>
  </div>
</template>
