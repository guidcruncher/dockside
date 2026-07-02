<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: "primary" | "default" | "danger" | "muted" | "success" | "warning" | "info"
  }>(),
  { variant: "default" },
)

const classes = {
  primary: "gc-btn-primary",
  danger: "gc-btn-danger",
  muted: "gc-btn-muted",
  success: "gc-btn-success",
  warning: "gc-btn-warning",
  info: "gc-btn-info",
  default: "gc-btn-surface",
}
</script>

<template>
  <button :class="classes[variant]">
    <slot />
  </button>
</template>
