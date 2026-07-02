<script setup lang="ts">
import { ref, watch } from "vue"

const props = defineProps<{
  side?: "left" | "right"
  modelValue?: boolean
}>()

const emit = defineEmits(["update:modelValue", "close"])

const isOpen = ref(props.modelValue ?? false)

watch(
  () => props.modelValue,
  (v: any) => {
    if (typeof v === "boolean") isOpen.value = v
  },
)

function open() {
  isOpen.value = true
  emit("update:modelValue", true)
}

function close() {
  isOpen.value = false
  emit("update:modelValue", false)
  emit("close")
}

defineExpose({ open, close })
</script>

<template>
  <!-- BACKDROP -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/40 z-40" @click="close" />

  <!-- DRAWER PANEL -->
  <div
    class="fixed top-0 bottom-0 w-72 bg-white shadow-xl z-50 transform transition-transform duration-300"
    :class="{
      '-translate-x-full': !isOpen && side !== 'right',
      'translate-x-0': isOpen && side !== 'right',
      'translate-x-full': !isOpen && side === 'right',
      'translate-x-0 right-0': isOpen && side === 'right',
    }"
  >
    <div class="h-full overflow-y-auto p-4">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* Prevent body scroll when drawer is open */
body.drawer-open {
  overflow: hidden;
}
</style>
