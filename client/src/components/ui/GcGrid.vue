<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    cols?: number
    gap?: "xs" | "sm" | "md" | "lg" | "xl"
    align?: "start" | "center" | "end"
  }>(),
  {
    cols: 1,
    gap: "md",
    align: "start",
  },
)

const colClass = `gc-grid-cols-${props.cols}`
const gapClass = `gc-grid-gap-${props.gap}`
const alignClass = {
  start: "gc-grid-start",
  center: "gc-grid-center",
  end: "gc-grid-end",
}[props.align]
</script>

<template>
  <div class="gc-grid" :class="[colClass, gapClass, alignClass]">
    <slot />
  </div>
</template>
