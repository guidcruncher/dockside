<script setup lang="ts">
import { computed } from "vue"
import type { Service } from "@/types"

const props = defineProps<{
  service: Service
}>()

const emit = defineEmits<{
  (e: "update", value: any): void
}>()

// Local wrapper — never use props.service directly
const service = computed(() => props.service)

const restartOptions = [
  { label: "No Restart", value: "no" },
  { label: "Always", value: "always" },
  { label: "On Failure", value: "on-failure" },
  { label: "Unless Stopped", value: "unless-stopped" },
]

function update(patch: Partial<Service>) {
  emit("update", { patchType: "service", patch: patch })
}
</script>

<template>
  <div class="space-y-6">
    <h3 class="text-sm font-medium">Basic</h3>

    <GcStack direction="column" gap="4">
      <GcInput
        placeholder="Image"
        :model-value="service.image"
        @update:model-value="(v: any) => update({ image: v })"
      />

      <GcInput
        placeholder="Container Name"
        :model-value="service.container_name"
        @update:model-value="(v: any) => update({ container_name: v })"
      />

      <GcTextarea
        placeholder="Command"
        :model-value="Array.isArray(service.command) ? service.command.join(' ') : service.command"
        @update:model-value="(v: any) => update({ command: v })"
      />

      <GcSelect
        placeholder="Restart Policy"
        :model-value="service.restart ?? ''"
        :options="restartOptions"
        @update:model-value="(v: any) => update({ restart: v })"
      />

      <EnvironmentEditor
        :model-value="service.environment"
        @update:model-value="(v: any) => update({ environment: v })"
      />
    </GcStack>
  </div>
</template>
