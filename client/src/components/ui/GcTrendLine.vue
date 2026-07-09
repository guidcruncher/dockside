<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  data: number[]
  width?: number
  height?: number
}>()

const w = computed(() => props.width || 200)
const h = computed(() => props.height || 60)

// Remove any NaN or undefined values before drawing
const cleanData = computed(() => props.data.filter((v) => Number.isFinite(v)))

const points = computed(() => {
  const d = cleanData.value

  if (d.length === 0) return ""

  // FIX 1: Single point → avoid division by zero
  if (d.length === 1) {
    const val = Math.max(0, Math.min(100, d[0]))
    const y = h.value - (val / 100) * h.value
    return `0,${y}`
  }

  // FIX 2: Safe step calculation
  const step = w.value / (d.length - 1)

  return d
    .map((val, i) => {
      // FIX 3: Clamp values 0–100
      const clampedVal = Math.max(0, Math.min(100, val))

      const x = i * step
      const y = h.value - (clampedVal / 100) * h.value

      return `${x},${y}`
    })
    .join(" ")
})
</script>

<template>
  <svg
    :viewBox="`0 0 ${w} ${h}`"
    :width="w"
    :height="h"
    class="overflow-visible"
    preserveAspectRatio="none"
  >
    <defs>
      <clipPath id="svgClip">
        <rect x="0" y="0" :width="w" :height="h" />
      </clipPath>
    </defs>

    <polyline
      :points="points"
      fill="none"
      class="stroke-primary transition-all duration-500 ease-in-out"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
      clip-path="url(#svgClip)"
    />
  </svg>
</template>
