<script setup lang="ts">
import { computed } from "vue"

const props = defineProps({
  type: {
    type: String,
    default: "info",
    validator: (v: string) => ["success", "danger", "warning", "info"].includes(v),
  },
})

const classes = computed(() => `gc-alert gc-alert-${props.type}`)
</script>

<template>
  <div :class="classes">
    <div class="gc-alert-icon">
      <slot name="icon" />
    </div>

    <div class="gc-alert-content">
      <div class="gc-alert-title">
        <slot name="title" />
      </div>

      <div class="gc-alert-description">
        <slot />
      </div>
    </div>
  </div>
</template>
