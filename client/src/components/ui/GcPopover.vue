<script setup lang="ts">
import { ref } from "vue"

const props = withDefaults(
  defineProps<{
    placement?: "top" | "bottom" | "left" | "right"
  }>(),
  { placement: "bottom" },
)

const open = ref(false)

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}
</script>

<template>
  <div class="gc-popover" @mouseleave="close">
    <div @click="toggle">
      <slot name="trigger" />
    </div>

    <div v-if="open" class="gc-popover-content" :data-placement="props.placement">
      <slot />
    </div>
  </div>
</template>
