<script setup lang="ts">
const props = defineProps<{
  level?: 1 | 2 | 3 | 4 | 5 | 6
  size?: "sm" | "md" | "lg" | "xl"
}>()

const tag = `h${props.level ?? 2}`

const sizeClass = {
  sm: "text-sm font-semibold",
  md: "text-base font-semibold",
  lg: "text-lg font-semibold",
  xl: "text-xl font-semibold",
}[props.size ?? "md"]
</script>

<template>
  <component :is="tag" :class="sizeClass">
    <slot />
  </component>
</template>
