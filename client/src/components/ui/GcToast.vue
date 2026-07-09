<script setup lang="ts">
import { useToasts } from "../../composables/useToasts"

const { toasts } = useToasts()

const props = defineProps<{
  message: string
  type: "success" | "error" | "warning" | "info"
}>()

function close() {
  const index = toasts.findIndex((t) => t.message === props.message)
  if (index !== -1) toasts.splice(index, 1)
}
</script>

<template>
  <div class="gc-toast" :class="`gc-toast-${type}`">
    <span>{{ message }}</span>
    <span class="gc-toast-close" @click="close">
      <GcIcon name="X" />
    </span>
  </div>
</template>
