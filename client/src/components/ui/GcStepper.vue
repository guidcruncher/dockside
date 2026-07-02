<script setup lang="ts">
import { ref, provide } from "vue"

const props = withDefaults(
  defineProps<{
    defaultStep?: number
  }>(),
  { defaultStep: 0 },
)

const active = ref(props.defaultStep)

function setStep(i: number) {
  active.value = i
}

provide("gc-stepper-active", active)
provide("gc-stepper-set", setStep)
</script>

<template>
  <div class="gc-stepper flex gap-4">
    <slot />
  </div>
</template>
