<script setup lang="ts">
import { ref, provide } from "vue"

const steps = ref<any[]>([])
const active = ref(0)

function registerStep(step: any) {
  steps.value.push(step)
}

function next() {
  if (active.value < steps.value.length - 1) active.value++
}

function back() {
  if (active.value > 0) active.value--
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
