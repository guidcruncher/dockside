<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    min?: string // min width of each item (e.g. "12rem")
    gap?: string // tailwind gap token (e.g. "gap-4")
  }>(),
  {
    min: "12rem",
    gap: "gap-4",
  },
)
</script>

<template>
  <div
    class="gc-grid-auto w-full"
    :class="props.gap"
    :style="{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${props.min}, 1fr))`,
    }"
  >
    <slot />
  </div>
</template>

<style>
/* No scoped styles — keeps tokens working */
</style>
