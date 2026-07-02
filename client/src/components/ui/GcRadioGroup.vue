<script setup lang="ts">
const props = defineProps<{
  modelValue: string | number
  options: Array<{ label: string; value: string | number }>
  size?: "sm" | "md" | "lg"
}>()

const emit = defineEmits(["update:modelValue"])

const sizeClasses = {
  sm: {
    outer: "h-3 w-3",
    inner: "h-1.5 w-1.5",
    label: "text-xs",
    gap: "gap-2",
  },
  md: {
    outer: "h-4 w-4",
    inner: "h-2 w-2",
    label: "text-sm",
    gap: "gap-3",
  },
  lg: {
    outer: "h-5 w-5",
    inner: "h-3 w-3",
    label: "text-base",
    gap: "gap-4",
  },
}

const s = props.size ?? "md"

function select(value: string | number) {
  emit("update:modelValue", value)
}
</script>

<template>
  <div class="gc-radio-group flex flex-col gap-2">
    <label
      v-for="opt in options"
      :key="opt.value"
      class="flex items-center cursor-pointer select-none"
      :class="sizeClasses[s].gap"
    >
      <span
        class="relative flex items-center justify-center rounded-full border border-border bg-surface transition-colors"
        :class="[
          sizeClasses[s].outer,
          modelValue === opt.value ? 'border-primary' : 'border-border',
        ]"
      >
        <span
          v-if="modelValue === opt.value"
          class="rounded-full bg-primary transition-all"
          :class="sizeClasses[s].inner"
        />
      </span>

      <span class="text-text" :class="sizeClasses[s].label" @click="select(opt.value)">
        {{ opt.label }}
      </span>

      <input
        type="radio"
        class="hidden"
        :value="opt.value"
        :checked="modelValue === opt.value"
        @change="select(opt.value)"
      />
    </label>
  </div>
</template>

<style>
.gc-radio-group {
  user-select: none;
}
</style>
