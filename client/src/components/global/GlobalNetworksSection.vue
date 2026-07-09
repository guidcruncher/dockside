<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  modelValue: any
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void
}>()

// Local wrapper — never use props.modelValue directly
const value = computed(() => props.modelValue)

function emitGlobalPatch(v: any) {
  emit("update:modelValue", {
    patchType: "global",
    patch: v,
  })
}
</script>

<template>
  <NetworksEditorAdvanced :model-value="value" @update:model-value="emitGlobalPatch" />
</template>
