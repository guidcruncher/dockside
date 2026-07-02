<script setup lang="ts">
import { computed } from "vue"
import type { Service, ServiceBuild } from "@/types"

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

/* ---------------------------------------
   Normalize build to always be an object
---------------------------------------- */
const build = computed<ServiceBuild>(() => {
  const b = service.value.build
  return typeof b === "object" && b !== null ? (b as ServiceBuild) : {}
})

/* ---------------------------------------
   Normalize args to always be a dictionary
---------------------------------------- */
const args = computed<Record<string, string>>(() => {
  const raw = build.value.args
  if (!raw) return {}

  if (Array.isArray(raw)) {
    const out: Record<string, string> = {}
    for (const entry of raw) {
      const [k, v] = String(entry).split("=")
      out[k] = v ?? ""
    }
    return out
  }

  return raw as Record<string, string>
})

function updateBuild(patch: Partial<ServiceBuild>) {
  update({ build: { ...build.value, ...patch } })
}

function updateArg(key: string, value: string) {
  const copy = { ...args.value }
  copy[key] = value
  updateBuild({ args: copy })
}

function removeArg(key: string) {
  const copy = { ...args.value }
  delete copy[key]
  updateBuild({ args: copy })
}
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-sm font-medium">Build</h3>

    <GcInput
      placeholder="Context"
      :model-value="build.context"
      @update:model-value="(v: any) => updateBuild({ context: v })"
    />

    <GcInput
      placeholder="Dockerfile"
      :model-value="build.dockerfile"
      @update:model-value="(v: any) => updateBuild({ dockerfile: v })"
    />

    <GcInput
      placeholder="Target"
      :model-value="build.target"
      @update:model-value="(v: any) => updateBuild({ target: v })"
    />

    <h4 class="text-sm font-medium">Build Args</h4>

    <div v-for="(val, key) in args" :key="key" class="flex gap-2 items-center">
      <GcInput class="flex-1" placeholder="Key" :model-value="key" disabled />

      <GcInput
        class="flex-1"
        placeholder="Value"
        :model-value="val"
        @update:model-value="(v: any) => updateArg(key, v)"
      />

      <GcButton variant="danger" @click="removeArg(key)"> Remove </GcButton>
    </div>

    <GcButton variant="primary" @click="updateArg('NEW_ARG', '')"> Add Arg </GcButton>
  </div>
</template>
