<script setup lang="ts">
import { computed } from "vue"
import type { LinuxCapability, Service } from "@/types"

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
</script>

<template>
  <div class="space-y-6">
    <h3 class="text-sm font-medium">Runtime</h3>

    <GcStack direction="column" gap="4">
      <ServiceVolumesEditor
        :model-value="service.volumes"
        @update:model-value="(v: any) => update({ volumes: v })"
      />

      <CapabilitySelector
        :model-value="{
          ...(service.cap_add?.reduce((acc: any, c: any) => ({ ...acc, [c]: true }), {}) ?? {}),
        }"
        @update:model-value="
          (caps: any) =>
            update({
              cap_add: Object.entries(caps)
                .filter(([_, enabled]) => enabled)
                .map(([cap]) => cap as LinuxCapability),
            })
        "
      />

      <GcCard>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex flex-col max-w-[75%]">
              <span class="font-medium text-sm">Privileged</span>
              <span class="text-xs opacity-80">
                Gives the container almost full root-level access to the host’s kernel — similar to
                running a VM without isolation.
              </span>
            </div>

            <GcToggleSwitch
              placeholder="Privileged"
              :model-value="service.privileged"
              @update:model-value="(v: any) => update({ privileged: v })"
            />
          </div>

          <div class="flex items-center justify-between">
            <div class="flex flex-col max-w-[75%]">
              <span class="font-medium text-sm">Read Only</span>
              <span class="text-xs opacity-80">
                Makes the container’s root filesystem immutable, preventing writes except to
                explicitly mounted volumes.</span
              >
            </div>

            <GcToggleSwitch
              placeholder="Read Only"
              :model-value="service.read_only"
              @update:model-value="(v: any) => update({ read_only: v })"
            />
          </div>

          <div class="flex items-center justify-between">
            <div class="flex flex-col max-w-[75%]">
              <span class="font-medium text-sm">IPC</span>
              <span class="text-xs opacity-80"> Set the IPC mode for the container </span>
            </div>

            <GcInput
              placeholder="IPC mode"
              :model-value="service.ipc"
              @update:model-value="(v: any) => update({ ipc: v })"
            />
          </div>
        </div>
      </GcCard>
    </GcStack>
  </div>
</template>
