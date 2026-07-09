<script setup lang="ts">
import { ref, provide } from "vue"

const props = defineProps<{ defaultIndex?: number }>()

const active = ref(props.defaultIndex ?? 0)

function setActive(i: number) {
  active.value = i
}

provide("gc-tabs-active", active)
provide("gc-tabs-set-active", setActive)
</script>

<template>
  <div class="gc-tabs">
    <slot />
  </div>
</template>
