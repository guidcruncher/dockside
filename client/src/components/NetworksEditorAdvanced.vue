<script setup lang="ts">
import { ref, computed } from "vue"
import type { Network } from "@/types"
import { Trash2, Settings } from "@lucide/vue"

const props = defineProps<{
  modelValue: Record<string, Network | null> | undefined
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: Record<string, Network | null>): void
}>()

const showIpamModal = ref(false)
const editingNetworkName = ref<string | null>(null)

// Local state for the key-value IPAM editor
const ipamForm = ref({ subnet: "", gateway: "", ip_range: "" })

const networks = computed<Record<string, Network | null>>({
  get: () => props.modelValue ?? {},
  set: (v) => emit("update:modelValue", v),
})

function openIpamModal(name: string) {
  editingNetworkName.value = name
  const net = networks.value[name]
  // Initialize form with existing data
  const config = net?.ipam?.config?.[0] ?? {}
  ipamForm.value = {
    subnet: config.subnet ?? "",
    gateway: config.gateway ?? "",
    ip_range: config.ip_range ?? "",
  }
  showIpamModal.value = true
}

function saveIpam() {
  if (editingNetworkName.value) {
    updateNetwork(editingNetworkName.value, {
      ipam: { config: [ipamForm.value] },
    })
  }
  showIpamModal.value = false
}

function updateNetwork(name: string, patch: Partial<Network>) {
  const existing = networks.value[name] ?? {}
  networks.value = {
    ...networks.value,
    [name]: { ...existing, ...patch } as Network,
  }
}

function removeNetwork(name: string) {
  const copy = { ...networks.value }
  delete copy[name]
  networks.value = copy
}
</script>

<template>
  <GcCard padding="p-4">
    <h3 class="text-sm font-medium">Networks</h3>
    <GcStack gap="4">
      <div v-for="(net, name) in networks" :key="name" class="border rounded-md p-4 space-y-4">
        <template v-if="net">
          <div class="flex items-center gap-2">
            <GcInput class="flex-1" :model-value="name" disabled placeholder="Name" />
            <GcButton variant="secondary" @click="openIpamModal(name)">
              <Settings class="w-4 h-4 mr-2" /> IPAM
            </GcButton>
            <GcButton variant="danger" @click="removeNetwork(name)">
              <Trash2 class="w-4 h-4" />
            </GcButton>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <GcSelect
              placeholder="Driver"
              :model-value="net.driver ?? 'bridge'"
              :options="[
                { label: 'Bridge', value: 'bridge' },
                { label: 'Overlay', value: 'overlay' },
              ]"
              @update:model-value="(v: string) => updateNetwork(name, { driver: v })"
            />
          </div>
        </template>
      </div>
    </GcStack>

    <GcModal v-model="showIpamModal">
      <template #header>
        <h3 class="text-lg font-bold">Edit IPAM</h3>
      </template>

      <div class="p-4 space-y-4">
        <GcInput placeholder="Subnet" v-model="ipamForm.subnet" />
        <GcInput placeholder="Gateway" v-model="ipamForm.gateway" />
        <GcInput placeholder="IP Range" v-model="ipamForm.ip_range" />
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <GcButton variant="secondary" @click="showIpamModal = false">Cancel</GcButton>
          <GcButton variant="primary" @click="saveIpam">Save</GcButton>
        </div>
      </template>
    </GcModal>
  </GcCard>
</template>
