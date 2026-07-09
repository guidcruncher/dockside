<script setup lang="ts">
import { inject, computed } from "vue"
import type { Ref } from "vue"

const props = defineProps<{ index: number }>()

const active = inject<Ref<number> | undefined>("gc-tabs-active")
const setActive = inject<((i: number) => void) | undefined>("gc-tabs-set-active")

const isActive = computed(() => active?.value === props.index)

function onClick() {
  setActive?.(props.index)
}
</script>

<template>
  <button
    class="px-4 py-2 text-sm font-medium border-b-2"
    :class="
      isActive
        ? 'border-blue-500 text-blue-400'
        : 'border-transparent text-gray-400 hover:text-gray-200'
    "
    @click="onClick"
  >
    <slot />
  </button>
</template>
