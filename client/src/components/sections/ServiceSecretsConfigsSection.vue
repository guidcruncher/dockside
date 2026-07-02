<script setup lang="ts">
import { computed } from "vue"
import type { Service, ServiceSecretOrConfig } from "@/types"

const props = defineProps<{
  service: Service
  availableSecrets: string[]
  availableConfigs: string[]
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

/* -------------------------------------------------------
   FORCE secrets/configs TO BE TREATED AS OBJECT ARRAYS
------------------------------------------------------- */
const secrets = computed<ServiceSecretOrConfig[]>(() => {
  return (service.value.secrets ?? []) as ServiceSecretOrConfig[]
})

const configs = computed<ServiceSecretOrConfig[]>(() => {
  return (service.value.configs ?? []) as ServiceSecretOrConfig[]
})

/* -------------------------------------------------------
   UPDATE HELPERS — ALWAYS USE THE TYPED ARRAYS ABOVE
------------------------------------------------------- */
function updateSecret(index: number, patch: Partial<ServiceSecretOrConfig>) {
  const copy = [...secrets.value]
  copy[index] = { ...copy[index], ...patch }
  update({ secrets: copy })
}

function updateConfig(index: number, patch: Partial<ServiceSecretOrConfig>) {
  const copy = [...configs.value]
  copy[index] = { ...copy[index], ...patch }
  update({ configs: copy })
}

/* -------------------------------------------------------
   ADD / REMOVE
------------------------------------------------------- */
function addSecret() {
  update({
    secrets: [...secrets.value, { source: "", target: "", uid: "", gid: "", mode: 0 }],
  })
}

function addConfig() {
  update({
    configs: [...configs.value, { source: "", target: "", uid: "", gid: "", mode: 0 }],
  })
}

function removeSecret(i: number) {
  const copy = [...secrets.value]
  copy.splice(i, 1)
  update({ secrets: copy })
}

function removeConfig(i: number) {
  const copy = [...configs.value]
  copy.splice(i, 1)
  update({ configs: copy })
}
</script>

<template>
  <div class="space-y-6">
    <h3 class="text-sm font-medium">Secrets & Configs</h3>

    <!-- SECRETS -->
    <div class="space-y-4">
      <h4 class="font-medium text-sm">Secrets</h4>

      <div v-for="(sec, i) in secrets" :key="i" class="border p-3 rounded space-y-3">
        <GcInput
          placeholder="Source"
          :model-value="sec.source"
          @update:model-value="(v: any) => updateSecret(i, { source: v })"
        />

        <GcInput
          placeholder="Target"
          :model-value="sec.target"
          @update:model-value="(v: any) => updateSecret(i, { target: v })"
        />

        <GcInput
          placeholder="UID"
          :model-value="sec.uid"
          @update:model-value="(v: any) => updateSecret(i, { uid: v })"
        />

        <GcInput
          placeholder="GID"
          :model-value="sec.gid"
          @update:model-value="(v: any) => updateSecret(i, { gid: v })"
        />

        <GcInput
          placeholder="Mode"
          type="number"
          :model-value="sec.mode"
          @update:model-value="(v: any) => updateSecret(i, { mode: Number(v) })"
        />

        <GcButton variant="danger" @click="removeSecret(i)"> Remove Secret </GcButton>
      </div>

      <GcButton variant="primary" @click="addSecret"> Add Secret </GcButton>
    </div>

    <!-- CONFIGS -->
    <div class="space-y-4">
      <h4 class="font-medium text-sm">Configs</h4>

      <div v-for="(cfg, i) in configs" :key="i" class="border p-3 rounded space-y-3">
        <GcInput
          placeholder="Source"
          :model-value="cfg.source"
          @update:model-value="(v: any) => updateConfig(i, { source: v })"
        />

        <GcInput
          placeholder="Target"
          :model-value="cfg.target"
          @update:model-value="(v: any) => updateConfig(i, { target: v })"
        />

        <GcInput
          placeholder="UID"
          :model-value="cfg.uid"
          @update:model-value="(v: any) => updateConfig(i, { uid: v })"
        />

        <GcInput
          placeholder="GID"
          :model-value="cfg.gid"
          @update:model-value="(v: any) => updateConfig(i, { gid: v })"
        />

        <GcInput
          placeholder="Mode"
          type="number"
          :model-value="cfg.mode"
          @update:model-value="(v: any) => updateConfig(i, { mode: Number(v) })"
        />

        <GcButton variant="danger" @click="removeConfig(i)"> Remove Config </GcButton>
      </div>

      <GcButton variant="primary" @click="addConfig"> Add Config </GcButton>
    </div>
  </div>
</template>
