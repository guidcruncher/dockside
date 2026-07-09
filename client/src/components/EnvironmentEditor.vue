<script setup lang="ts">
import { computed } from "vue"
import type { EnvironmentRecord } from "@/types"
import { Trash2 } from "@lucide/vue"

const props = defineProps<{
  modelValue: EnvironmentRecord | string[] | undefined
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: EnvironmentRecord): void
}>()

// Normalize input into object form
function normaliseEnv(env: EnvironmentRecord | string[] | undefined): EnvironmentRecord {
  if (!env) return {}

  if (Array.isArray(env)) {
    const out: EnvironmentRecord = {}
    for (const line of env) {
      const [k, ...rest] = line.split("=")
      out[k] = rest.join("=")
    }
    return out
  }

  return env
}

// Computed wrapper
const env = computed<EnvironmentRecord>({
  get: () => normaliseEnv(props.modelValue),
  set: (v: EnvironmentRecord) => emit("update:modelValue", v),
})

// Update a single key
function setKey(key: string, value: string) {
  env.value = {
    ...env.value,
    [key]: value,
  }
}

// Remove a key
function removeKey(key: string) {
  const copy = { ...env.value }
  delete copy[key]
  env.value = copy
}

// Add a new variable
function addVariable() {
  let name = "NEW_VAR"
  let i = 1
  while (env.value[name]) {
    name = `NEW_VAR_${i++}`
  }

  env.value = {
    ...env.value,
    [name]: "",
  }
}
</script>

<template>
  <GcCard padding="p-4 space-y-6">
    <div class="space-y-1">
      <h2 class="text-base font-semibold">Environment Variables</h2>
      <p class="text-sm opacity-80">Key-value pairs passed into the container</p>
    </div>
    <GcStack direction="column" gap="4">
      <div v-for="(value, key) in env" :key="key" class="border rounded-md p-4">
        <div class="flex flex-row items-center gap-4 w-full">
          <GcInput class="w-48" placeholder="Key" :model-value="key" disabled />

          <GcInput
            class="flex-1"
            placeholder="Value"
            :model-value="value"
            @update:model-value="(v: any) => setKey(key, v)"
          />

          <GcButton variant="danger" @click="removeKey(key)">
            <Trash2 class="w-5 h-5" />
          </GcButton>
        </div>
      </div>
      <GcButton variant="primary" @click="addVariable"> Add Variable </GcButton>
    </GcStack>
  </GcCard>
</template>
