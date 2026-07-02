<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  modelValue: string | null
  size?: "sm" | "md" | "lg"
}>()

const emit = defineEmits(["update:modelValue"])

const sizeClasses = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-3 text-base",
}

const s = props.size ?? "md"

// Parse incoming value
const hour = computed({
  get: () => props.modelValue?.split(":")[0] ?? "00",
  set: (val: string) => {
    emit("update:modelValue", `${val}:${minute.value}`)
  },
})

const minute = computed({
  get: () => props.modelValue?.split(":")[1] ?? "00",
  set: (val: string) => {
    emit("update:modelValue", `${hour.value}:${val}`)
  },
})

// Generate hours 00–23
const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))

// Generate minutes 00–59
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"))
</script>

<template>
  <div class="gc-timepicker flex items-center gap-2">
    <!-- Hour dropdown -->
    <select
      class="border border-border bg-surface text-text rounded-md"
      :class="sizeClasses[s]"
      v-model="hour"
    >
      <option v-for="h in hours" :key="h" :value="h">{{ h }}</option>
    </select>

    <span class="text-text opacity-60">:</span>

    <!-- Minute dropdown -->
    <select
      class="border border-border bg-surface text-text rounded-md"
      :class="sizeClasses[s]"
      v-model="minute"
    >
      <option v-for="m in minutes" :key="m" :value="m">{{ m }}</option>
    </select>
  </div>
</template>

<style>
/* No scoped styles — avoids inheritance issues */
</style>
