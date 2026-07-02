<script setup lang="ts">
import { inject, computed } from "vue"
import type { Ref } from "vue"

const props = defineProps<{ index: number }>()

const active = inject<Ref<number> | undefined>("gc-tabs-active")

const isActive = computed(() => active?.value === props.index)
</script>

<template>
  <div v-if="isActive" class="gc-tab-panel">
    <slot />
  </div>
</template>
