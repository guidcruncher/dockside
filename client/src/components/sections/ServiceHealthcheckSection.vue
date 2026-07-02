<script setup lang="ts">
import { computed } from "vue"
import type { Service, ServiceHealthcheck } from "@/types"

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
// Normalize healthcheck → always an object
// ---------------------------------------------------------
const healthcheck = computed<ServiceHealthcheck>(() => {
  const h = service.value.healthcheck
  return typeof h === "object" && h !== null ? h : {}
})

function updateHealthcheckField(key: keyof ServiceHealthcheck, value: any) {
  update({
    healthcheck: {
      ...healthcheck.value,
      [key]: value,
    },
  })
}
</script>

<template>
  <div class="space-y-6">
    <GcCard>
      <h3 class="text-sm font-medium">Healthcheck</h3>

      <GcStack direction="column" gap="4">
        <GcInput
          placeholder="Test Command"
          :model-value="healthcheck.test"
          @update:model-value="(v: any) => updateHealthcheckField('test', v)"
        />

        <GcInput
          placeholder="Interval"
          :model-value="healthcheck.interval"
          @update:model-value="(v: any) => updateHealthcheckField('interval', v)"
        />

        <GcInput
          placeholder="Timeout"
          :model-value="healthcheck.timeout"
          @update:model-value="(v: any) => updateHealthcheckField('timeout', v)"
        />
      </GcStack>
    </GcCard>
  </div>
</template>
