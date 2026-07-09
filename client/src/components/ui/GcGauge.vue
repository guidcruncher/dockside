<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(
  defineProps<{
    value?: number
    size?: "sm" | "md" | "lg"
    thresholds?: { danger: number; warning: number }
  }>(),
  {
    size: "md",
  },
)

// SAFETY: sanitize and clamp incoming value
const safeValue = computed(() => {
  const v = Number(props.value)
  if (!Number.isFinite(v)) return 0
  return Math.max(0, Math.min(100, v))
})

const sizeMap = {
  sm: [64, 25, 6, "text-xs"],
  md: [128, 50, 10, "text-xl"],
  lg: [192, 75, 14, "text-3xl"],
} as const

const config = computed(() => sizeMap[props.size])
const viewBox = computed(() => config.value[0])
const radius = computed(() => config.value[1])
const strokeWidth = computed(() => config.value[2])
const textSize = computed(() => config.value[3])

const circumference = computed(() => 2 * Math.PI * radius.value)

// SAFETY: use safeValue instead of props.value
const strokeDashoffset = computed(() => {
  return circumference.value - (safeValue.value / 100) * circumference.value
})

const statusColor = computed(() => {
  const v = safeValue.value
  if (props.thresholds?.danger && v >= props.thresholds.danger) return "stroke-danger"
  if (props.thresholds?.warning && v >= props.thresholds.warning) return "stroke-warning"
  return "stroke-primary"
})
</script>

<template>
  <div class="relative inline-flex items-center justify-center">
    <svg :width="viewBox" :height="viewBox" class="transform -rotate-90">
      <circle
        class="text-border"
        stroke="currentColor"
        :stroke-width="strokeWidth"
        fill="transparent"
        :r="radius"
        :cx="viewBox / 2"
        :cy="viewBox / 2"
      />
      <circle
        :class="statusColor"
        stroke="currentColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        fill="transparent"
        :r="radius"
        :cx="viewBox / 2"
        :cy="viewBox / 2"
        :style="{
          strokeDasharray: circumference,
          strokeDashoffset: strokeDashoffset,
          transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.3s ease',
        }"
      />
    </svg>

    <!-- FIXED: use safeValue instead of undefined "value" -->
    <div :class="['absolute font-bold text-text', textSize]">{{ Math.round(safeValue) }}%</div>
  </div>
</template>
