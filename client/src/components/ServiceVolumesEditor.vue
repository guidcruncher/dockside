<script setup lang="ts">
import { computed } from "vue"
import type { ServiceVolume } from "@/types"
import { Trash2 } from "@lucide/vue"

const props = defineProps<{
  modelValue: ServiceVolume[] | undefined
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: ServiceVolume[]): void
}>()

const volumeTypeOptions = [
  { label: "Bind Mount", value: "bind" },
  { label: "Named Volume", value: "volume" },
]

// Computed wrapper
const volumes = computed<ServiceVolume[]>({
  get: () => props.modelValue ?? [],
  set: (v: any) => emit("update:modelValue", v),
})

// Update a single volume
function updateVolume(index: number, patch: Partial<ServiceVolume>) {
  const copy = [...volumes.value]
  copy[index] = { ...copy[index], ...patch }
  volumes.value = copy
}

// Add a new volume
function addVolume() {
  volumes.value = [
    ...volumes.value,
    {
      type: "bind",
      source: "",
      target: "",
    },
  ]
}

// Remove a volume
function removeVolume(index: number) {
  const copy = [...volumes.value]
  copy.splice(index, 1)
  volumes.value = copy
}
</script>

<template>
  <GcCard padding="p-4 space-y-4">
    <h3 class="text-base font-semibold">Volumes</h3>
    <GcStack direction="column" gap="4">
      <div v-for="(vol, index) in volumes" :key="index" class="border p-3 rounded-md">
        <div class="flex flex-row items-center gap-3 w-full">
          <GcSelect
            class="w-40"
            placeholder="Type"
            :model-value="vol.type"
            :options="volumeTypeOptions"
            @update:model-value="(v: any) => updateVolume(index, { type: v })"
          />
          <GcInput
            class="flex-1"
            placeholder="Host Path (source)"
            :model-value="vol.source"
            @update:model-value="(v: any) => updateVolume(index, { source: v })"
          />
          <GcInput
            class="flex-1"
            placeholder="Container Path (target)"
            :model-value="vol.target"
            @update:model-value="(v: any) => updateVolume(index, { target: v })"
          />
          <GcButton variant="danger" @click="removeVolume(index)">
            <Trash2 class="w-5 h-5" />
          </GcButton>
        </div>
      </div>
      <GcButton variant="primary" @click="addVolume"> Add Volume </GcButton>
    </GcStack>
  </GcCard>
</template>
