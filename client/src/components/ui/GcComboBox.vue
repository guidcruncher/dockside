<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"

const props = defineProps<{
  modelValue: string | null
  items: { label: string; value: string }[]
  placeholder?: string
}>()

const emit = defineEmits(["update:modelValue"])

const open = ref(false)
const query = ref("")
const highlighted = ref(0)

// Sync query with selected label
const selectedLabel = computed(() => {
  const found = props.items.find((i) => i.value === props.modelValue)
  return found?.label ?? ""
})

function syncQuery() {
  if (!open.value) query.value = selectedLabel.value
}

const filtered = computed(() =>
  props.items.filter((i) => i.label.toLowerCase().includes(query.value.toLowerCase())),
)

function select(item: { label: string; value: string }) {
  emit("update:modelValue", item.value)
  query.value = item.label
  open.value = false
}

function onKey(e: KeyboardEvent) {
  if (!open.value && (e.key === "ArrowDown" || e.key === "Enter")) {
    open.value = true
    return
  }

  if (e.key === "ArrowDown") {
    highlighted.value = (highlighted.value + 1) % filtered.value.length
  }

  if (e.key === "ArrowUp") {
    highlighted.value = (highlighted.value - 1 + filtered.value.length) % filtered.value.length
  }

  if (e.key === "Enter") {
    select(filtered.value[highlighted.value])
  }

  if (e.key === "Escape") {
    open.value = false
  }
}

function clickOutside(e: MouseEvent) {
  const el = e.target as HTMLElement
  if (!el.closest(".gc-combobox")) {
    open.value = false
    syncQuery()
  }
}

onMounted(() => document.addEventListener("click", clickOutside))
onBeforeUnmount(() => document.removeEventListener("click", clickOutside))
</script>

<template>
  <div class="gc-combobox relative w-full">
    <input
      type="text"
      v-model="query"
      :placeholder="placeholder"
      @focus="open = true"
      @keydown="onKey"
      class="w-full px-3 py-2 rounded border bg-surface text-text border-border focus:outline-none focus:ring-2 focus:ring-primary"
    />

    <div
      v-if="open"
      class="absolute left-0 right-0 mt-1 bg-surface border border-border rounded shadow-lg z-50 max-h-60 overflow-auto"
    >
      <div
        v-for="(item, i) in filtered"
        :key="item.value"
        @click="select(item)"
        class="px-3 py-2 cursor-pointer"
        :class="{
          'bg-primary text-primary-foreground': i === highlighted,
          'hover:bg-muted': i !== highlighted,
        }"
      >
        {{ item.label }}
      </div>

      <div v-if="filtered.length === 0" class="px-3 py-2 text-muted italic">No results</div>
    </div>
  </div>
</template>

<style>
/* No scoped styles — keeps tokens working */
</style>
