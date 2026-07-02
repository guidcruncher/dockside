<script setup lang="ts">
import { computed } from "vue"
import type { Volume } from "@/types"
import { Trash2 } from "@lucide/vue"

const props = defineProps<{
  modelValue: Record<string, Volume | null> | undefined
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: Record<string, Volume | null>): void
}>()

// Computed wrapper
const volumes = computed<Record<string, Volume | null>>({
  get: () => props.modelValue ?? {},
  set: (v: any) => emit("update:modelValue", v),
})

// Add new volume
function addVolume() {
  volumes.value = {
    ...volumes.value,
    new_volume: {
      driver: "local",
      labels: {},
    },
  }
}

// Remove volume
function removeVolume(name: string) {
  const copy = { ...volumes.value }
  delete copy[name]
  volumes.value = copy
}

// Update volume entry
function updateVolume(name: string, patch: Partial<Volume>) {
  volumes.value = {
    ...volumes.value,
    [name]: {
      ...(volumes.value[name] ?? {}),
      ...patch,
    },
  }
}
</script>

<template>
  <GcCard padding="p-4 space-y-4">
    <h3 class="text-base font-semibold">Volumes</h3>

    <GcStack direction="column" gap="4">
      <div v-for="(vol, name) in volumes" :key="name" class="border p-3 rounded-md">
        <div class="flex flex-row items-center gap-3 w-full">
          <GcInput class="w-40" placeholder="Volume Name" :model-value="name" disabled />

          <GcSelect
            class="flex-1"
            placeholder="Driver"
            :model-value="vol?.driver"
            :options="['local', 'nfs', 'tmpfs']"
            @update:model-value="(v: any) => updateVolume(name, { driver: v })"
          />

          <GcInput
            class="flex-1"
            placeholder="External Name"
            :model-value="typeof vol?.external === 'object' ? vol.external.name : ''"
            @update:model-value="
              (v: any) =>
                updateVolume(name, {
                  external: v ? { name: v } : false,
                })
            "
          />

          <GcButton variant="danger" @click="removeVolume(name)">
            <Trash2 class="w-5 h-5" />
          </GcButton>
        </div>
      </div>

      <GcButton variant="primary" @click="addVolume"> Add Volume </GcButton>
    </GcStack>
  </GcCard>
</template>
