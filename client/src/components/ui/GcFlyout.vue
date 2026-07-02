<script setup lang="ts">
import { ref } from "vue"

const props = withDefaults(
  defineProps<{
    placement?: "left" | "right"
  }>(),
  { placement: "right" },
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
  <div class="gc-flyout">
    <div @click="toggle">
      <slot name="trigger" />
    </div>

    <div v-if="open" class="gc-flyout-panel" :data-placement="props.placement">
      <button class="gc-flyout-close" type="button" @click="close">
        <GcIcon name="X" />
      </button>
      <slot />
    </div>
  </div>
</template>
