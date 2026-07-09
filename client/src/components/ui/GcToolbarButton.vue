<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: "primary" | "default"
  }>(),
  { variant: "default" },
)

const classes = {
  primary: "flex items-center gap-1 px-2 py-1 gc-btn-primary",
  default:
    "flex items-center gap-1 px-2 py-1 gc-btn bg-surface text-text border border-border hover:bg-surface/80",
}
</script>

<template>
  <button :class="classes[variant]">
    <slot />
  </button>
</template>
