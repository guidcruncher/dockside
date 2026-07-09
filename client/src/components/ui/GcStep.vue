<script setup lang="ts">
import { inject } from "vue"
import type { Ref } from "vue"

const props = defineProps<{
  index: number
  label: string
}>()

const active = inject<Ref<number>>("gc-stepper-active")!
const setStep = inject<(i: number) => void>("gc-stepper-set")!
</script>

<template>
  <div
    class="gc-step cursor-pointer"
    :class="{ 'gc-step-active': active === props.index }"
    @click="setStep(props.index)"
  >
    <span class="gc-step-label">{{ props.label }}</span>
  </div>
</template>
