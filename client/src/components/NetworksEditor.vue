<script setup lang="ts">
import { computed } from "vue"
import type { Network } from "@/types"
import { Trash2 } from "@lucide/vue"

const props = defineProps<{
  modelValue: Record<string, Network | null> | undefined
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: Record<string, Network | null>): void
}>()

const networkDriverOptions = [
  { label: "Bridge", value: "bridge" },
  { label: "Overlay", value: "overlay" },
  { label: "Host", value: "host" },
  { label: "Macvlan", value: "macvlan" },
  { label: "None", value: "none" },
]

// Computed wrapper around modelValue
const networks = computed<Record<string, Network | null>>({
  get: () => props.modelValue ?? {},
  set: (v: any) => emit("update:modelValue", v),
})

// Add a new network
function addNetwork() {
  let name = "new_network"
  let i = 1
  while (networks.value[name]) {
    name = `new_network_${i++}`
  }

  networks.value = {
    ...networks.value,
    [name]: {
      driver: "bridge",
      labels: {},
    },
  }
}

// Remove a network
function removeNetwork(name: string) {
  const copy = { ...networks.value }
  delete copy[name]
  networks.value = copy
}

// Update a network entry
function updateNetwork(name: string, patch: Partial<Network>) {
  const existing = networks.value[name] ?? {}
  networks.value = {
    ...networks.value,
    [name]: { ...existing, ...patch },
  }
}
</script>

<template>
  <GcCard padding="p-4 space-y-6">
    <h3 class="text-sm font-medium">Networks</h3>
    <div class="space-y-1">
      <h2 class="text-base font-semibold">Networks</h2>
      <p class="text-sm opacity-80">Define top‑level Docker networks</p>
    </div>

    <GcStack direction="column" gap="4">
      <div v-for="(net, name) in networks" :key="name" class="border rounded-md p-3">
        <div class="flex flex-row items-center gap-3 w-full">
          <GcInput class="w-40" placeholder="Network Name" :model-value="name" disabled />

          <GcSelect
            class="flex-1"
            placeholder="Driver"
            :model-value="net?.driver ?? 'bridge'"
            :options="networkDriverOptions"
            @update:model-value="(v: any) => updateNetwork(name, { driver: v })"
          />

          <GcInput
            class="flex-1"
            placeholder="External Name"
            :model-value="typeof net?.external === 'object' ? net.external.name : ''"
            @update:model-value="
              (v: any) =>
                updateNetwork(name, {
                  external: v ? { name: v } : false,
                })
            "
          />

          <GcButton variant="danger" @click="removeNetwork(name)">
            <Trash2 class="w-5 h-5" />
          </GcButton>
        </div>
      </div>

      <GcButton variant="primary" @click="addNetwork"> Add Network </GcButton>
    </GcStack>
  </GcCard>
</template>
