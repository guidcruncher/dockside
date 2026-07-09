<script setup lang="ts">
const props = defineProps<{
  modelValue: Array<string | number>
  options: Array<{ label: string; value: string | number }>
  size?: "sm" | "md" | "lg"
}>()

const emit = defineEmits(["update:modelValue"])

const sizeClasses = {
  sm: {
    box: "h-3 w-3",
    check: "h-2 w-2",
    label: "text-xs",
    gap: "gap-2",
  },
  md: {
    box: "h-4 w-4",
    check: "h-3 w-3",
    label: "text-sm",
    gap: "gap-3",
  },
  lg: {
    box: "h-5 w-5",
    check: "h-4 w-4",
    label: "text-base",
    gap: "gap-4",
  },
}

const s = props.size ?? "md"

function toggle(value: string | number) {
  const exists = props.modelValue.includes(value)
  const next = exists
    ? props.modelValue.filter((v: any) => v !== value)
    : [...props.modelValue, value]

  emit("update:modelValue", next)
}
</script>

<template>
  <div class="gc-checkbox-group flex flex-col gap-2">
    <label
      v-for="opt in options"
      :key="opt.value"
      class="flex items-center cursor-pointer select-none"
      :class="sizeClasses[s].gap"
    >
      <span
        class="relative flex items-center justify-center rounded border border-border bg-surface transition-colors"
        :class="[
          sizeClasses[s].box,
          modelValue.includes(opt.value) ? 'bg-primary border-primary' : 'bg-surface border-border',
        ]"
      >
        <svg
          v-if="modelValue.includes(opt.value)"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="3"
          stroke="white"
          class="transition-all"
          :class="sizeClasses[s].check"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>

      <span class="text-text" :class="sizeClasses[s].label" @click="toggle(opt.value)">
        {{ opt.label }}
      </span>

      <input
        type="checkbox"
        class="hidden"
        :value="opt.value"
        :checked="modelValue.includes(opt.value)"
        @change="toggle(opt.value)"
      />
    </label>
  </div>
</template>

<style>
.gc-checkbox-group {
  user-select: none;
}
</style>
