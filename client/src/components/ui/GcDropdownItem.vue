<script setup lang="ts">
import { inject } from "vue"

const props = defineProps<{
  danger?: boolean
  disabled?: boolean
}>()

const close = inject<() => void | undefined>("gc-dropdown-close")

const emit = defineEmits<{
  (e: "select"): void
}>()

function onSelect() {
  if (props.disabled) return
  emit("select")
  close?.()
}
</script>

<template>
  <button
    type="button"
    class="gc-dropdown-item"
    :class="{
      'gc-dropdown-item-danger': props.danger,
      'opacity-50 cursor-not-allowed pointer-events-none': props.disabled,
    }"
    @click="onSelect"
  >
    <slot />
  </button>
</template>
