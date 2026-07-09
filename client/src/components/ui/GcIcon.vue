<script setup lang="ts">
import { computed } from "vue"
import { lucideIcons } from "../../icons/lucide"

type IconName = keyof typeof lucideIcons | string

const props = withDefaults(
  defineProps<{
    name: IconName
    size?: number | string
    stroke?: number
    class?: string
  }>(),
  {
    size: 20,
    stroke: 2,
  },
)

// Convert string → number
const numericSize = computed(() =>
  typeof props.size === "string" ? Number(props.size) : props.size,
)

// Detect if name is an image URL
const isImage = computed(
  () =>
    typeof props.name === "string" &&
    (props.name.startsWith("http") ||
      props.name.startsWith("/") ||
      props.name.startsWith("./") ||
      props.name.startsWith("data:")),
)

// Lucide component (if exists)
const IconComp = computed(() =>
  !isImage.value ? lucideIcons[props.name as keyof typeof lucideIcons] : null,
)
</script>

<template>
  <!-- Render image URL -->
  <img
    v-if="isImage"
    :src="props.name"
    :width="numericSize"
    :height="numericSize"
    class="gc-icon object-contain"
    :class="props.class"
    alt=""
  />

  <!-- Render Lucide icon -->
  <component
    v-else-if="IconComp"
    :is="IconComp"
    :size="numericSize"
    :stroke-width="props.stroke"
    class="gc-icon text-current"
    :class="props.class"
  />

  <!-- Fallback -->
  <span v-else class="gc-icon-missing text-red-500">?</span>
</template>
