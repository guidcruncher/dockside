<script setup lang="ts">
const props = withDefaults(defineProps<{ size?: "sm" | "md" | "lg"; src?: string }>(), {
  size: "md",
})

const classes = {
  sm: "gc-avatar-sm",
  md: "gc-avatar-md",
  lg: "gc-avatar-lg",
}
</script>

<template>
  <div :class="classes[size]">
    <img v-if="src" :src="src" class="w-full h-full rounded-full object-cover" />
    <slot v-else />
  </div>
</template>
