<script setup lang="ts">
import { computed } from "vue"
import type { ServicePort } from "@/types"
import { Trash2 } from "@lucide/vue"

const props = defineProps<{
  modelValue: (string | ServicePort)[] | undefined
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: ServicePort[]): void
}>()

// Normalise port formats
function normalisePort(p: string | ServicePort): ServicePort {
  if (typeof p === "string") {
    const [mapping, proto = "tcp"] = p.split("/")
    const [published, target] = mapping.split(":").map(Number)

    return {
      published,
      target,
      protocol: proto as ServicePort["protocol"],
      description: "",
    }
  }

  return {
    ...p,
    protocol: p.protocol ?? "tcp",
    description: p.description ?? "",
  }
}

// Computed wrapper
const ports = computed<ServicePort[]>({
  get: () => (props.modelValue ?? []).map(normalisePort),
  set: (v: any) => emit("update:modelValue", v),
})

// Add port
function addPort() {
  ports.value = [...ports.value, { published: 8080, target: 80, protocol: "tcp", description: "" }]
}

// Remove port
function removePort(i: number) {
  ports.value = ports.value.filter((_, idx) => idx !== i)
}

// Update port
function updatePort(i: number, patch: Partial<ServicePort>) {
  ports.value = ports.value.map((p, idx) => (idx === i ? { ...p, ...patch } : p))
}
</script>

<template>
  <GcCard padding="p-4 space-y-6">
    <div class="space-y-1">
      <h2 class="text-base font-semibold">Ports</h2>
      <p class="text-sm opacity-80">Map container ports to host ports</p>
    </div>
    <GcStack direction="column" gap="4">
      <div v-for="(port, i) in ports" :key="i" class="border rounded-md p-4 space-y-4">
        <div class="flex flex-row gap-4 w-full">
          <GcInput
            class="flex-1"
            placeholder="Published (Host Port)"
            type="number"
            :model-value="port.published"
            @update:model-value="(v: any) => updatePort(i, { published: Number(v) })"
          />
          <GcInput
            class="flex-1"
            placeholder="Target (Container Port)"
            type="number"
            :model-value="port.target"
            @update:model-value="(v: any) => updatePort(i, { target: Number(v) })"
          />
          <GcSelect
            class="w-32"
            placeholder="Protocol"
            :model-value="port.protocol"
            :options="[
              { label: 'TCP', value: 'tcp' },
              { label: 'UDP', value: 'udp' },
              { label: 'SCTP', value: 'sctp' },
            ]"
            @update:model-value="(v: any) => updatePort(i, { protocol: v })"
          />
        </div>

        <div class="flex flex-row gap-4 w-full">
          <GcInput
            class="flex-1"
            placeholder="Description (optional)"
            :model-value="port.description"
            @update:model-value="(v: any) => updatePort(i, { description: v })"
          />
          <GcButton variant="danger" @click="removePort(i)">
            <Trash2 class="w-5 h-5" />
          </GcButton>
        </div>
      </div>
      <GcButton variant="primary" @click="addPort"> Add Port </GcButton>
    </GcStack>
  </GcCard>
</template>
