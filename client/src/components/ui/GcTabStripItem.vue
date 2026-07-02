<script setup lang="ts">
import { inject, computed } from "vue"

const props = defineProps<{
  name: string
  label: string
}>()

const active = inject<any>("gcTabsActive")
const select = inject<any>("gcTabsSelect")

const isActive = computed(() => active?.value === props.name)
</script>

<template>
  <button
    class="flex h-full items-center px-5 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer"
    :class="{
      // ACTIVE: Uses primary text/border and a subtle primary background
      'border-primary text-primary bg-primary/10': isActive,

      // INACTIVE: Uses muted text/transparent border, hover tint
      'border-transparent text-muted hover:text-text hover:bg-muted-soft': !isActive,
    }"
    @click="select(props.name)"
  >
    {{ props.label }}
  </button>
</template>
