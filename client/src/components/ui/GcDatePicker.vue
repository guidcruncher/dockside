<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"

const props = defineProps<{
  modelValue: string | null
  size?: "sm" | "md" | "lg"
}>()

const emit = defineEmits(["update:modelValue"])

const open = ref(false)
const selected = ref(props.modelValue ? new Date(props.modelValue) : null)
const viewDate = ref(selected.value ? new Date(selected.value) : new Date())

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function selectDate(date: Date) {
  selected.value = date
  emit("update:modelValue", date.toISOString().split("T")[0])
  close()
}

function prevMonth() {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1)
}

function nextMonth() {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1)
}

const days = computed(() => {
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const grid = []
  for (let i = 0; i < firstDay; i++) grid.push(null)
  for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(year, month, d))

  return grid
})

function onClickOutside(e: MouseEvent) {
  if (!(e.target as HTMLElement).closest(".gc-datepicker")) close()
}

onMounted(() => document.addEventListener("click", onClickOutside))
onBeforeUnmount(() => document.removeEventListener("click", onClickOutside))

const sizeClasses = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-3 text-base",
}

const s = props.size ?? "md"
</script>

<template>
  <div class="gc-datepicker relative inline-block">
    <button
      class="w-full border border-border bg-surface text-text rounded-md flex items-center justify-between hover:border-muted transition-colors"
      :class="sizeClasses[s]"
      @click.stop="toggle"
    >
      <span>{{ selected ? selected.toLocaleDateString() : "Select date" }}</span>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 opacity-60"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      v-if="open"
      class="absolute z-50 mt-2 w-64 rounded-md border border-border bg-surface shadow-lg p-3"
    >
      <div class="flex items-center justify-between mb-2">
        <button @click="prevMonth" class="p-1 hover:bg-muted/20 rounded">‹</button>

        <span class="font-medium text-text">
          {{ viewDate.toLocaleString("default", { month: "long" }) }}
          {{ viewDate.getFullYear() }}
        </span>

        <button @click="nextMonth" class="p-1 hover:bg-muted/20 rounded">›</button>
      </div>

      <div class="grid grid-cols-7 text-center text-xs text-muted mb-1">
        <span v-for="d in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" :key="d">{{ d }}</span>
      </div>

      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="(d, i) in days"
          :key="i"
          class="h-8 rounded flex items-center justify-center transition-colors"
          :class="[
            d ? 'hover:bg-muted/20 text-text' : 'pointer-events-none',
            selected && d && selected.toDateString() === d.toDateString()
              ? 'bg-primary text-white'
              : '',
          ]"
          @click="d && selectDate(d)"
        >
          {{ d ? d.getDate() : "" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style>
/* No scoped styles — avoids inheritance issues */
</style>
