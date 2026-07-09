<script setup lang="ts">
const props = defineProps<{
  modelValue?: any
  type?: string
  placeholder?: string
}>()

const emit = defineEmits(["update:modelValue"])

function onInput(e: Event) {
  const target = e.target as HTMLInputElement | null
  if (!target) return
  emit("update:modelValue", target.value)
}
</script>

<template>
  <input
    :type="type || 'text'"
    class="gc-input"
    :placeholder="placeholder"
    :value="modelValue"
    @input="onInput"
  />
</template>
