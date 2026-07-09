<script setup lang="ts">
import { computed } from "vue"

const props = defineProps({
  label: { type: String, default: "" },
  status: {
    type: String,
    default: "neutral",
    validator: (v: string) => ["success", "danger", "warning", "info", "neutral"].includes(v),
  },
  dismissible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["close"])

const classes = computed(() => `gc-chip gc-chip-${props.status}`)
</script>

<template>
  <div :class="classes">
    <slot name="icon" />

    {{ label }}

    <button
      v-if="dismissible"
      class="gc-chip-close"
      @click="emit('close')"
      aria-label="Remove chip"
    >
      <slot name="close-icon" />
    </button>
  </div>
</template>
