<script setup lang="ts">
import { computed } from "vue"

const props = defineProps({
  variant: {
    type: String,
    default: "info",
    validator: (v: string) => ["info", "success", "warning", "danger", "muted"].includes(v),
  },
  title: {
    type: String,
    default: "",
  },
  dismissible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["close"])

const classes = computed(() => `gc-callout gc-callout-${props.variant}`)
</script>

<template>
  <div :class="classes">
    <slot name="icon" />

    <div class="flex-1">
      <div v-if="title" class="gc-callout-title">{{ title }}</div>
      <div class="gc-callout-body">
        <slot />
      </div>
    </div>

    <button
      v-if="dismissible"
      class="opacity-60 hover:opacity-100 transition"
      @click="emit('close')"
      aria-label="Dismiss callout"
    >
      <slot name="close-icon" />
    </button>
  </div>
</template>
