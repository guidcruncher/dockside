<script setup lang="ts">
import { ref, provide, watch } from "vue"

const props = defineProps<{
  modelValue?: number
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: number): void
  (e: "select", value: number): void
}>()

const active = ref(props.modelValue ?? 0)

watch(
  () => props.modelValue,
  (v: any) => {
    active.value = v ?? 0
  },
)

const steps = ref<any[]>([])

function registerStep(step: any) {
  steps.value.push(step)
}

function next() {
  if (active.value < steps.value.length - 1) {
    active.value++
    emit("update:modelValue", active.value)
    emit("select", active.value)
  }
}

function back() {
  if (active.value > 0) {
    active.value--
    emit("update:modelValue", active.value)
    emit("select", active.value)
  }
}

provide("gc-wizard-register", registerStep)
provide("gc-wizard-active", active)
provide("gc-wizard-next", next)
provide("gc-wizard-back", back)
</script>

<template>
  <div class="gc-wizard">
    <slot />
  </div>
</template>

<style>
.gc-wizard {
  background: rgb(var(--gc-bg));
  color: rgb(var(--gc-text));
  padding: 24px;
  border-radius: 12px;
}
</style>
