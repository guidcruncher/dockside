<script setup lang="ts">
import { inject } from "vue"
import type { Ref } from "vue"

const props = defineProps<{ index: number }>()

const active = inject<Ref<number>>("gc-stepper-active")!
</script>

<template>
  <div v-show="active === props.index" class="gc-step-panel">
    <slot />
  </div>
</template>
