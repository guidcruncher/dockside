<script setup lang="ts">
import { computed } from "vue"
import type { ComposeConfig } from "@/types"

const props = defineProps<{
  modelValue: ComposeConfig
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: ComposeConfig): void
}>()

// Local reactive proxy to the parent’s ComposeConfig
const cfg = computed({
  get: () => props.modelValue,
  set: (v: ComposeConfig) => emit("update:modelValue", v),
})

// Always emit a *full updated object*
function update(patch: Partial<ComposeConfig>) {
  cfg.value = {
    ...cfg.value,
    ...patch,
  }
}
</script>

<template>
  <GcCard padding="p-4 space-y-6">
    <div class="space-y-1">
      <h2 class="text-base font-semibold">Project Settings</h2>
      <p class="text-sm opacity-80">Basic metadata for this Compose project</p>
    </div>

    <GcStack direction="column" gap="4">
      <GcInput
        placeholder="Project Name"
        :model-value="cfg.name"
        @update:model-value="(v: any) => update({ name: v })"
      />

      <GcInput
        placeholder="Version"
        :model-value="cfg.version"
        @update:model-value="(v: any) => update({ version: v })"
      />
    </GcStack>
  </GcCard>
</template>
