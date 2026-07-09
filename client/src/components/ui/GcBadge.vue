<!-- src/components/gc/GcBadge.vue -->
<script setup lang="ts">
import { computed } from "vue"

interface Props {
  variant?: "success" | "warning" | "danger" | "neutral" | "secondary"
  icon?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  variant: "secondary",
  icon: null,
})

const classes = computed(() => {
  return {
    success: "bg-green-100 text-green-700 border-green-300",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-300",
    danger: "bg-red-100 text-red-700 border-red-300",
    neutral: "bg-gray-100 text-gray-700 border-gray-300",
    secondary: "bg-gray-50 text-gray-500 border-gray-200",
  }[props.variant]
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border"
    :class="classes"
  >
    <GcIcon v-if="icon" :name="icon" class="w-3 h-3" />
    <slot />
  </span>
</template>
