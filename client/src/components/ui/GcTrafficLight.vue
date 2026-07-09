<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(
  defineProps<{
    status: "red" | "yellow" | "green" | "off"
    size?: "sm" | "md" | "lg"
  }>(),
  {
    size: "md",
  },
)

const sizeMap = {
  sm: { w: 40, h: 100, r: 12, pos: [20, 25, 50, 75] },
  md: { w: 60, h: 150, r: 18, pos: [30, 35, 75, 115] },
  lg: { w: 80, h: 200, r: 24, pos: [40, 45, 100, 155] },
}

const dimensions = computed(() => sizeMap[props.size])

const getFill = (color: "red" | "yellow" | "green") => {
  if (props.status === color) {
    return color === "red" ? "fill-danger" : color === "yellow" ? "fill-warning" : "fill-success"
  }
  return "fill-muted-soft"
}
</script>

<template>
  <div class="relative inline-flex">
    <svg
      :width="dimensions.w"
      :height="dimensions.h"
      :viewBox="`0 0 ${dimensions.w} ${dimensions.h}`"
      class="overflow-visible"
    >
      <rect
        x="5"
        y="5"
        :width="dimensions.w - 10"
        :height="dimensions.h - 10"
        rx="15"
        class="fill-muted-foreground/10 stroke-border"
        stroke-width="2"
      />

      <circle
        :cx="dimensions.pos[0]"
        :cy="dimensions.pos[1]"
        :r="dimensions.r"
        :class="getFill('red')"
      />
      <circle
        :cx="dimensions.pos[0]"
        :cy="dimensions.pos[2]"
        :r="dimensions.r"
        :class="getFill('yellow')"
      />
      <circle
        :cx="dimensions.pos[0]"
        :cy="dimensions.pos[3]"
        :r="dimensions.r"
        :class="getFill('green')"
      />

      <circle
        :cx="dimensions.pos[0] - 5"
        :cy="dimensions.pos[1] - 5"
        :r="dimensions.r / 4"
        class="fill-white/20"
      />
    </svg>
  </div>
</template>
