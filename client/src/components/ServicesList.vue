<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  services: { name: string }[]
  selected?: string | null
}>()

const emit = defineEmits<{
  (e: "select", name: string): void
}>()

const sorted = computed(() =>
  props.services.filter((s) => s && s.name).sort((a, b) => a.name.localeCompare(b.name)),
)

function selectService(name: string) {
  emit("select", name)
}
</script>

<template>
  <div
    class="h-12 w-full shrink-0 border-b border-border bg-surface overflow-x-auto scrollbar-hide"
  >
    <div
      style="overflow-x: auto"
      class="flex h-full w-max min-w-full items-center px-4 flex-nowrap"
    >
      <button
        v-for="svc in sorted"
        :key="svc.name"
        class="flex h-full items-center whitespace-nowrap px-5 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer"
        :class="[
          svc.name === props.selected
            ? 'border-primary text-primary bg-primary/10'
            : 'border-transparent text-muted hover:text-text hover:bg-muted-soft',
        ]"
        @click="selectService(svc.name)"
      >
        {{ svc.name }}
      </button>
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
