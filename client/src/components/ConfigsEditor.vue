<script setup lang="ts">
import { computed } from "vue"
import type { Config } from "@/types"
import { Trash2 } from "@lucide/vue"

const props = defineProps<{
  modelValue: Record<string, Config> | undefined
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: Record<string, Config>): void
}>()

// Computed wrapper around modelValue
const configs = computed({
  get: () => props.modelValue ?? {},
  set: (v: Record<string, Config>) => emit("update:modelValue", v),
})

// Add new config
function addConfig() {
  configs.value = {
    ...configs.value,
    new_config: {
      file: "",
      labels: {},
    },
  }
}

// Remove config
function removeConfig(name: string) {
  const copy = { ...configs.value }
  delete copy[name]
  configs.value = copy
}

// Update a single config entry
function updateConfig(name: string, patch: Partial<Config>) {
  configs.value = {
    ...configs.value,
    [name]: {
      ...configs.value[name],
      ...patch,
    },
  }
}
</script>

<template>
  <GcCard padding="p-4 space-y-4">
    <h3 class="text-base font-semibold">Configs</h3>

    <GcStack direction="column" gap="4">
      <div v-for="(cfg, name) in configs" :key="name" class="border p-3 rounded-md">
        <div class="flex flex-row items-center gap-3 w-full">
          <GcInput class="w-40" placeholder="Config Name" :model-value="name" disabled />

          <GcInput
            class="flex-1"
            placeholder="File Path"
            :model-value="cfg.file"
            @update:model-value="(v: any) => updateConfig(name, { file: v })"
          />

          <GcInput
            class="flex-1"
            placeholder="External Name"
            :model-value="typeof cfg.external === 'object' ? cfg.external.name : ''"
            @update:model-value="
              (v: any) =>
                updateConfig(name, {
                  external: v ? { name: v } : false,
                })
            "
          />

          <GcButton variant="danger" @click="removeConfig(name)">
            <Trash2 class="w-5 h-5" />
          </GcButton>
        </div>
      </div>

      <GcButton variant="primary" @click="addConfig"> Add Config </GcButton>
    </GcStack>
  </GcCard>
</template>
