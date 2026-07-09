<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    size?: "sm" | "md" | "lg" | "xl" | "default"
  }>(),
  { size: "default" },
)

const classes = {
  default: "gc-container",
  sm: "gc-container-sm",
  md: "gc-container-md",
  lg: "gc-container-lg",
  xl: "gc-container-xl",
}
</script>

<template>
  <div :class="classes[size]">
    <slot />
  </div>
</template>
