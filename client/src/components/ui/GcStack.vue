<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    gap?: "xs" | "sm" | "md" | "lg" | "xl"
  }>(),
  { gap: "md" },
)

const classes = {
  xs: "gc-stack-xs",
  sm: "gc-stack-sm",
  md: "gc-stack-md",
  lg: "gc-stack-lg",
  xl: "gc-stack-xl",
}
</script>

<template>
  <div class="gc-stack" :class="classes[gap]">
    <slot />
  </div>
</template>
