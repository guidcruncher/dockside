<script setup lang="ts">
import { inject, onMounted, computed } from "vue"
import type { Ref } from "vue"

const props = defineProps<{
  index: number
  title?: string
  description?: string
}>()

const register = inject<((step: any) => void) | null>("gc-wizard-register", null)
const active = inject<Ref<number> | null>("gc-wizard-active", null)

const isActive = computed(() => active?.value === props.index)

onMounted(() => {
  register?.(props)
})
</script>

<template>
  <div v-if="isActive" class="gc-wizard-step">
    <slot />
  </div>
</template>

<style>
.gc-wizard-step {
  background: rgb(var(--gc-surface));
  border: 1px solid rgb(var(--gc-border));
  color: rgb(var(--gc-text));
  padding: 24px;
  border-radius: 12px;
}
</style>
