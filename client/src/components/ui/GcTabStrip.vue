<script setup lang="ts">
import { provide, watch, ref } from "vue"
import { useWindowSize } from "@/composables/useWindowSize"

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>()

const { maxWidth } = useWindowSize()
const active = ref(props.modelValue)

watch(
  () => props.modelValue,
  (v: any) => (active.value = v),
)

function selectTab(name: string) {
  active.value = name
  emit("update:modelValue", name)
}

provide("gcTabsActive", active)
provide("gcTabsSelect", selectTab)
</script>

<template>
  <div
    class="h-12 shrink-0 border-b border-border bg-surface overflow-x-auto scrollbar-hide"
    :style="{ width: `${maxWidth - 60}px` }"
  >
    <div class="flex h-full w-max items-center px-4 flex-nowrap">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
