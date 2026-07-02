<script setup lang="ts">
const props = defineProps<{
  modelValue?: string
  placeholder?: string
}>()

const emit = defineEmits(["update:modelValue"])

function onInput(e: Event) {
  const target = e.target as HTMLTextAreaElement | null
  if (!target) return
  emit("update:modelValue", target.value)
}
</script>

<template>
  <textarea
    class="gc-textarea"
    :placeholder="placeholder"
    :value="modelValue"
    @input="onInput"
  ></textarea>
</template>
