<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: "primary" | "default" | "danger" | "ghost" | "muted" | "success" | "warning" | "info"
    disabled?: boolean
  }>(),
  { variant: "default" },
)

const classes = {
  primary: "gc-btn-primary",
  danger: "gc-btn-danger",
  muted: "gc-btn-muted",
  ghost: "gc-btn-muted",
  success: "gc-btn-success",
  warning: "gc-btn-warning",
  info: "gc-btn-info",
  default: "gc-btn-surface",
}
</script>

<template>
  <button
    :class="[classes[variant], disabled && 'opacity-50 cursor-not-allowed pointer-events-none']"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>
