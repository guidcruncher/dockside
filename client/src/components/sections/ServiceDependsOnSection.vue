<script setup lang="ts">
import { computed } from "vue"
import type { Service, ServiceDependency, ServiceDependencyCondition } from "@/types"
import { Trash2 } from "@lucide/vue"

const props = defineProps<{
  service: Service
  availableServices: string[]
}>()

const emit = defineEmits<{
  (e: "update", value: any): void
}>()

function update(patch: Partial<Service>) {
  emit("update", { patchType: "service", patch: patch })
}

// ---------------------------------------------------------
// Normalize ANY depends_on map into valid ServiceDependency objects
// ---------------------------------------------------------
function normalize(map: Record<string, any>): Record<string, ServiceDependency> {
  const out: Record<string, ServiceDependency> = {}

  for (const [name, dep] of Object.entries(map)) {
    out[name] = {
      condition: (typeof dep === "string" ? dep : dep.condition) as ServiceDependencyCondition,
    }
  }

  return out
}

// ---------------------------------------------------------
// Computed normalized depends_on
// ---------------------------------------------------------
const depends = computed<Record<string, ServiceDependency>>(() => {
  return normalize(props.service.depends_on ?? {})
})

// ---------------------------------------------------------
// Update condition
// ---------------------------------------------------------
function setCondition(name: string, condition: string) {
  const raw = {
    ...depends.value,
    [name]: { condition }, // raw string
  }

  const normalized = normalize(raw)
  update({ depends_on: normalized })
}

// ---------------------------------------------------------
// Remove dependency
// ---------------------------------------------------------
function remove(name: string) {
  const raw = { ...depends.value }
  delete raw[name]

  const normalized = normalize(raw)
  update({ depends_on: normalized })
}
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-sm font-medium">Depends On</h3>
    <div v-for="(dep, name) in depends" :key="name" class="border p-3 rounded space-y-2">
      <span class="font-medium text-sm">{{ name }}</span>

      <div class="flex flex-row gap-4 w-full">
        <GcInput
          class="flex-1"
          placeholder="Condition (service_started, service_healthy, service_completed_successfully)"
          :model-value="dep.condition"
          @update:model-value="(v: any) => setCondition(name, v)"
        />
        <GcButton variant="danger" @click="remove(name)">
          <Trash2 class="w-5 h-5" />
        </GcButton>
      </div>
    </div>
    <GcSelect
      placeholder="Add dependency"
      :model-value="null"
      :options="props.availableServices"
      @update:model-value="
        (v: any) => {
          if (v) setCondition(v, 'service_started')
        }
      "
    />
  </div>
</template>
