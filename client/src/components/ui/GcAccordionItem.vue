<script setup lang="ts">
import { inject, ref, onMounted, nextTick, watch } from "vue"

const props = defineProps<{ id: string }>()

const openItems = inject("gc-accordion-open") as any
const toggle = inject("gc-accordion-toggle") as (id: string) => void

const panel = ref<HTMLElement | null>(null)
const isOpen = ref(false)

watch(
  () => openItems.value,
  () => {
    isOpen.value = openItems.value.has(props.id)
    updateHeight()
  },
  { immediate: true },
)

function updateHeight() {
  if (!panel.value) return

  if (isOpen.value) {
    // Expand to content height
    panel.value.style.maxHeight = panel.value.scrollHeight + "px"
  } else {
    // Collapse fully
    panel.value.style.maxHeight = "0px"
  }
}

onMounted(() => nextTick(updateHeight))
</script>

<template>
  <div class="gc-accordion-item">
    <div class="gc-accordion-header" @click="toggle(props.id)">
      <span class="gc-accordion-title">
        <slot name="title" />
      </span>

      <span class="gc-accordion-icon" :class="{ 'gc-accordion-icon-open': isOpen }"> › </span>
    </div>

    <!-- PANEL (controls height) -->
    <div ref="panel" class="gc-accordion-panel">
      <!-- INNER WRAPPER (holds padding + content) -->
      <div class="gc-accordion-inner">
        <slot />
      </div>
    </div>
  </div>
</template>
