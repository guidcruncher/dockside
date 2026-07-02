<script setup lang="ts">
import { computed } from "vue"

type Option = string | { label: string; value: string | number }

const props = defineProps<{
  modelValue: string | number | null
  options: Option[]
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number | null): void
}>()

// Normalise options into {label, value}
const normalised = computed(() =>
  props.options.map((opt) => (typeof opt === "string" ? { label: opt, value: opt } : opt)),
)
</script>

<template>
  <select
    class="gc-select bg-surface text-text border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 hover:border-muted transition-colors"
    :value="modelValue"
    @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-if="placeholder" disabled value="">
      {{ placeholder }}
    </option>

    <option v-for="opt in normalised" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>
