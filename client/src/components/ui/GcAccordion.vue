<script setup lang="ts">
import { ref, provide } from "vue"

const openItems = ref<Set<string>>(new Set())

function toggle(id: string) {
  const next = new Set(openItems.value) // clone

  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }

  openItems.value = next
}

provide("gc-accordion-open", openItems)
provide("gc-accordion-toggle", toggle)
</script>

<template>
  <div class="gc-accordion">
    <slot />
  </div>
</template>
