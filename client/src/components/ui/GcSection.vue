<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    padding?: "xs" | "sm" | "md" | "lg" | "xl"
    background?: "default" | "surface" | "muted" | "primary"
  }>(),
  {
    padding: "md",
    background: "default",
  },
)

const paddingClasses = {
  xs: "gc-section-xs",
  sm: "gc-section-sm",
  md: "gc-section-md",
  lg: "gc-section-lg",
  xl: "gc-section-xl",
}

const bgClasses = {
  default: "gc-section-bg-default",
  surface: "gc-section-bg-surface",
  muted: "gc-section-bg-muted",
  primary: "gc-section-bg-primary",
}
</script>

<template>
  <section :class="['gc-section', paddingClasses[padding], bgClasses[background]]">
    <slot />
  </section>
</template>
