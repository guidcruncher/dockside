<script setup lang="ts">
import { computed } from "vue"
import type { Service, ServiceLogging } from "@/types"
import { Trash2 } from "@lucide/vue"

const props = defineProps<{
  service: Service
}>()

const emit = defineEmits<{
  (e: "update", value: any): void
}>()

function update(patch: Partial<Service>) {
  emit("update", { patchType: "service", patch: patch })
}

// ---------------------------------------------------------
// LOCAL WRAPPER — never use props.service directly
// ---------------------------------------------------------
const service = computed(() => props.service)

// ---------------------------------------------------------
// Normalize logging → always an object
// ---------------------------------------------------------
const logging = computed<ServiceLogging>(() => {
  const l = service.value.logging
  return typeof l === "object" && l !== null ? (l as ServiceLogging) : {}
})

// ---------------------------------------------------------
// Normalize logging.options → always an object
// ---------------------------------------------------------
const options = computed<Record<string, string | number | null>>(() => {
  return logging.value.options ?? {}
})

function updateOption(key: string, value: string) {
  const root: ServiceLogging = {
    ...logging.value,
    options: { ...options.value, [key]: value },
  }
  update({ logging: root })
}

function removeOption(key: string) {
  const copy = { ...options.value }
  delete copy[key]

  const root: ServiceLogging = {
    ...logging.value,
    options: copy,
  }

  update({ logging: root })
}
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-sm font-medium">Logging</h3>

    <GcInput
      placeholder="Driver (e.g. json-file)"
      :model-value="logging.driver"
      @update:model-value="(v: any) => update({ logging: { ...logging, driver: v } })"
    />

    <h4 class="text-sm font-medium">Options</h4>

    <div v-for="(val, key) in options" :key="key" class="flex gap-2 items-center">
      <GcInput class="flex-1" placeholder="Key" :model-value="key" disabled />

      <GcInput
        class="flex-1"
        placeholder="Value"
        :model-value="val"
        @update:model-value="(v: any) => updateOption(key, v)"
      />

      <GcButton variant="danger" @click="removeOption(key)"> <Trash2 class="w-5 h-5" /></GcButton>
    </div>

    <GcButton variant="primary" @click="updateOption('NEW_OPTION', '')"> Add Option </GcButton>
  </div>
</template>
