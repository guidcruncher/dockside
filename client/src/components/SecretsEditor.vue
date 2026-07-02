<script setup lang="ts">
import { computed } from "vue"
import type { Secret } from "@/types"
import { Trash2 } from "@lucide/vue"

const props = defineProps<{
  modelValue: Record<string, Secret> | undefined
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: Record<string, Secret>): void
}>()

// Computed wrapper around modelValue
const secrets = computed<Record<string, Secret>>({
  get: () => props.modelValue ?? {},
  set: (v: any) => emit("update:modelValue", v),
})

// Add a new secret
function addSecret() {
  secrets.value = {
    ...secrets.value,
    new_secret: {
      file: "",
      labels: {},
    },
  }
}

// Remove a secret
function removeSecret(name: string) {
  const copy = { ...secrets.value }
  delete copy[name]
  secrets.value = copy
}

// Update a secret entry
function updateSecret(name: string, patch: Partial<Secret>) {
  secrets.value = {
    ...secrets.value,
    [name]: {
      ...secrets.value[name],
      ...patch,
    },
  }
}
</script>

<template>
  <GcCard padding="p-4 space-y-4">
    <h3 class="text-base font-semibold">Secrets</h3>

    <GcStack direction="column" gap="4">
      <div v-for="(secret, name) in secrets" :key="name" class="border p-3 rounded-md">
        <div class="flex flex-row items-center gap-3 w-full">
          <GcInput class="w-40" placeholder="Secret Name" :model-value="name" disabled />

          <GcInput
            class="flex-1"
            placeholder="File Path"
            :model-value="secret.file"
            @update:model-value="(v: any) => updateSecret(name, { file: v })"
          />

          <GcInput
            class="flex-1"
            placeholder="External Name"
            :model-value="typeof secret.external === 'object' ? secret.external.name : ''"
            @update:model-value="
              (v: any) =>
                updateSecret(name, {
                  external: v ? { name: v } : false,
                })
            "
          />

          <GcButton variant="danger" @click="removeSecret(name)">
            <Trash2 class="w-5 h-5" />
          </GcButton>
        </div>
      </div>

      <GcButton variant="primary" @click="addSecret"> Add Secret </GcButton>
    </GcStack>
  </GcCard>
</template>
