<script setup lang="ts">
import { computed } from "vue"
import type { LinuxCapability, ServiceCapabilitiesRecord } from "@/types"
import { LinuxCapabilityGroups } from "@/types"
import { useCapabilityDescriptions } from "@/composables/useCapabilityDescriptions"

const props = defineProps<{
  modelValue: ServiceCapabilitiesRecord
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: ServiceCapabilitiesRecord): void
}>()

const { getDescription } = useCapabilityDescriptions()

const value = computed({
  get: () => props.modelValue,
  set: (v: any) => emit("update:modelValue", v),
})

function toggle(cap: LinuxCapability) {
  value.value = {
    ...value.value,
    [cap]: !value.value[cap],
  }
}

function isEnabled(cap: LinuxCapability) {
  return !!value.value[cap]
}
</script>

<template>
  <GcCard padding="p-4 space-y-6">
    <div class="space-y-1">
      <h2 class="text-base font-semibold">Linux Capabilities</h2>
      <p class="text-sm opacity-80">Fine-grained privilege controls for containers</p>
    </div>

    <div class="space-y-6">
      <div v-for="group in LinuxCapabilityGroups" :key="group.id" class="space-y-3">
        <GcHeading size="sm">{{ group.label }}</GcHeading>

        <div class="grid grid-cols-2 gap-x-8 gap-y-3">
          <div
            v-for="cap in group.capabilities"
            :key="cap"
            class="flex items-center justify-between"
          >
            <div class="flex flex-col max-w-[75%]">
              <span class="font-medium text-sm">{{ cap }}</span>
              <span class="text-xs opacity-80">
                {{ getDescription(cap) }}
              </span>
            </div>

            <GcToggleSwitch
              :model-value="isEnabled(cap)"
              @update:model-value="() => toggle(cap)"
              size="md"
            />
          </div>
        </div>

        <GcDivider />
      </div>
    </div>
  </GcCard>
</template>
