<script setup lang="ts">
import { ref, computed } from "vue"
import type { Volume } from "@/types"
import { Trash2, Settings } from "@lucide/vue"

const props = defineProps<{
  modelValue: Record<string, Volume | null> | undefined
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: Record<string, Volume | null>): void
}>()

const showDriverOptsModal = ref(false)
const editingVolumeName = ref<string | null>(null)
const driverOptsJson = ref("")

const volumes = computed<Record<string, Volume | null>>({
  get: () => props.modelValue ?? {},
  set: (v) => emit("update:modelValue", v),
})

function updateVolume(name: string, patch: Partial<Volume>) {
  const existing = volumes.value[name] ?? {}
  volumes.value = {
    ...volumes.value,
    [name]: { ...existing, ...patch } as Volume,
  }
}

function openDriverOptsModal(name: string) {
  editingVolumeName.value = name
  const vol = volumes.value[name]
  driverOptsJson.value = JSON.stringify(vol?.driver_opts ?? {}, null, 2)
  showDriverOptsModal.value = true
}

function saveDriverOpts() {
  if (editingVolumeName.value) {
    try {
      const parsed = JSON.parse(driverOptsJson.value)
      updateVolume(editingVolumeName.value, { driver_opts: parsed })
    } catch (e) {
      alert("Invalid JSON format")
      return
    }
  }
  showDriverOptsModal.value = false
}

function addVolume() {
  const name = "new_volume"
  volumes.value = { ...volumes.value, [name]: { driver: "local" } }
}

function removeVolume(name: string) {
  const copy = { ...volumes.value }
  delete copy[name]
  volumes.value = copy
}
</script>

<template>
  <GcCard padding="p-4">
    <h3 class="text-sm font-medium">Volumes</h3>
    <GcStack gap="4">
      <div v-for="(vol, name) in volumes" :key="name" class="border rounded-md p-4 space-y-4">
        <template v-if="vol">
          <div class="flex items-center gap-2">
            <GcInput class="flex-1" :model-value="name" disabled />
            <GcButton variant="secondary" @click="openDriverOptsModal(name)">
              <Settings class="w-4 h-4 mr-2" /> Options
            </GcButton>
            <GcButton variant="danger" @click="removeVolume(name)">
              <Trash2 class="w-4 h-4" />
            </GcButton>
          </div>

          <GcSelect
            placeholder="Driver"
            :model-value="vol.driver ?? 'local'"
            :options="[
              { label: 'Local', value: 'local' },
              { label: 'NFS', value: 'nfs' },
              { label: 'Tmpfs', value: 'tmpfs' },
            ]"
            @update:model-value="(v: string) => updateVolume(name, { driver: v })"
          />

          <GcInput
            placeholder="External Name"
            :model-value="
              typeof vol.external === 'object' && vol.external !== null ? vol.external.name : ''
            "
            @update:model-value="
              (v: string) => updateVolume(name, { external: v ? { name: v } : false })
            "
          />
        </template>
      </div>
      <GcButton variant="primary" @click="addVolume">Add Volume</GcButton>
    </GcStack>

    <GcModal v-model="showDriverOptsModal">
      <template #header><h3 class="text-lg font-bold">Driver Options</h3></template>
      <div class="p-4">
        <GcTextarea
          v-model="driverOptsJson"
          class="w-full h-32 p-2 border rounded font-mono text-sm"
          placeholder='{"device": "/dev/sdb1", "type": "ext4"}'
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <GcButton variant="secondary" @click="showDriverOptsModal = false">Cancel</GcButton>
          <GcButton variant="primary" @click="saveDriverOpts">Save</GcButton>
        </div>
      </template>
    </GcModal>
  </GcCard>
</template>
