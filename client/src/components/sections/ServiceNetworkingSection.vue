<script setup lang="ts">
import { computed } from "vue"
import type { Service } from "@/types"

const props = defineProps<{
  service: Service
}>()

const emit = defineEmits<{
  (e: "update", value: any): void
}>()

function update(patch: Partial<Service>) {
  emit("update", { patchType: "service", patch: patch })
}

// Local wrapper — never use props.service directly
const service = computed(() => props.service)

const networkModeOptions = [
  { label: "Bridge", value: "bridge" },
  { label: "Host", value: "host" },
  { label: "None", value: "none" },
]
</script>

<template>
  <div class="space-y-6">
    <h3 class="text-sm font-medium">Networking</h3>

    <GcStack direction="column" gap="4">
      <PortsEditor
        :model-value="service.ports"
        @update:model-value="(v: any) => update({ ports: v })"
      />

      <GcSelect
        placeholder="Network Mode"
        :model-value="service.network_mode"
        :options="networkModeOptions"
        @update:model-value="(v: any) => update({ network_mode: v })"
      />
    </GcStack>
  </div>
</template>
