<script setup lang="ts">
import { computed } from "vue"
import type { Service, ServiceDeploy } from "@/types"

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
// Normalize deploy → always an object
// ---------------------------------------------------------
const deploy = computed<ServiceDeploy>(() => {
  const d = service.value.deploy
  return typeof d === "object" && d !== null ? d : {}
})

// ---------------------------------------------------------
// Nested update helper
// ---------------------------------------------------------
function updateNested(path: string[], value: any) {
  const root: any = structuredClone(deploy.value)
  let obj = root

  for (let i = 0; i < path.length - 1; i++) {
    obj[path[i]] = obj[path[i]] ?? {}
    obj = obj[path[i]]
  }

  obj[path[path.length - 1]] = value
  update({ deploy: root })
}
</script>

<template>
  <div class="space-y-6">
    <GcCard>
      <h3 class="text-sm font-medium">Deploy</h3>

      <GcInput
        placeholder="Restart condition"
        :model-value="deploy.restart_policy?.condition"
        @update:model-value="(v: any) => updateNested(['restart_policy', 'condition'], v)"
      />

      <GcInput
        placeholder="CPU limit"
        :model-value="deploy.resources?.limits?.cpus"
        @update:model-value="(v: any) => updateNested(['resources', 'limits', 'cpus'], v)"
      />

      <GcInput
        placeholder="Memory limit"
        :model-value="deploy.resources?.limits?.memory"
        @update:model-value="(v: any) => updateNested(['resources', 'limits', 'memory'], v)"
      />

      <GcInput
        placeholder="Placement constraint"
        :model-value="deploy.placement?.constraints?.[0]"
        @update:model-value="(v: any) => updateNested(['placement', 'constraints'], [v])"
      />

      <GcInput
        placeholder="Update order"
        :model-value="deploy.update_config?.order"
        @update:model-value="(v: any) => updateNested(['update_config', 'order'], v)"
      />

      <GcInput
        placeholder="Rollback order"
        :model-value="deploy.rollback_config?.order"
        @update:model-value="(v: any) => updateNested(['rollback_config', 'order'], v)"
      />
    </GcCard>
  </div>
</template>
