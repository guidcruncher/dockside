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

// ---------------------------------------------------------
// LOCAL WRAPPER — never use props.service directly
// ---------------------------------------------------------
const service = computed(() => props.service)

// ---------------------------------------------------------
// Profiles helpers
// ---------------------------------------------------------
function updateArray(index: number, value: string) {
  const arr = [...(service.value.profiles ?? [])]
  arr[index] = value
  update({ profiles: arr })
}

function add() {
  update({ profiles: [...(service.value.profiles ?? []), ""] })
}

function remove(i: number) {
  const arr = [...(service.value.profiles ?? [])]
  arr.splice(i, 1)
  update({ profiles: arr })
}
</script>

<template>
  <div class="space-y-3">
    <h3 class="text-sm font-medium">Profiles</h3>

    <div v-for="(p, i) in service.profiles ?? []" :key="i" class="flex gap-2 items-center">
      <GcInput
        placeholder="profile name"
        :model-value="p"
        @update:model-value="(v: any) => updateArray(i, v)"
      />
      <GcButton variant="danger" @click="remove(i)">Remove</GcButton>
    </div>

    <GcButton variant="primary" @click="add">Add Profile</GcButton>
  </div>
</template>
