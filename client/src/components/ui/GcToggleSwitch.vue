<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  size?: "sm" | "md" | "lg"
  label?: string
}>()

const emit = defineEmits(["update:modelValue"])

const sizeClasses = {
  sm: {
    wrapper: "h-4 w-8",
    thumb: "h-3 w-3",
    translateOn: "translate-x-4",
    translateOff: "translate-x-1",
  },
  md: {
    wrapper: "h-6 w-11",
    thumb: "h-4 w-4",
    translateOn: "translate-x-5",
    translateOff: "translate-x-1",
  },
  lg: {
    wrapper: "h-8 w-14",
    thumb: "h-6 w-6",
    translateOn: "translate-x-6",
    translateOff: "translate-x-1",
  },
}

const s = props.size ?? "md"

function toggle() {
  emit("update:modelValue", !props.modelValue)
}
</script>

<template>
  <span class="text-text text-sm" v-if="label">{{ label }}</span>
  <button
    class="gc-toggle relative inline-flex items-center rounded-full transition-colors border"
    :class="[
      sizeClasses[s].wrapper,
      props.modelValue ? 'bg-primary/30 border-primary' : 'bg-muted-soft border-muted',
    ]"
    @click="toggle"
    type="button"
    role="switch"
    :aria-checked="props.modelValue"
  >
    <span
      class="gc-toggle-thumb inline-block transform rounded-full shadow transition-transform"
      :class="[
        sizeClasses[s].thumb,
        props.modelValue ? sizeClasses[s].translateOn + ' bg-primary' : sizeClasses[s].translateOff,
      ]"
    />
  </button>
</template>

<style>
.gc-toggle {
  cursor: pointer;
  user-select: none;
}

/* Thumb uses tokens, not Tailwind dark: */
.gc-toggle-thumb {
  /* light mode: slightly darker than track */
  background-color: rgb(var(--gc-muted));
}

[data-theme="dark"] .gc-toggle-thumb {
  /* dark mode: lighter than track */
  background-color: rgb(var(--gc-muted));
}
</style>
