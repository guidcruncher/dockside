<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { usePortainer } from "@/composables/usePortainer"
import type { ComposeConfig } from "@/types"
import { useWindowSize } from "@/composables/useWindowSize"

const { maxHeight } = useWindowSize()

const props = defineProps<{
  modelValue?: number | null
}>()

interface SelectParams {
  template: any
  config: ComposeConfig
}
const emit = defineEmits<{
  (e: "update:modelValue", key: number | null): void
  (e: "select", opts: SelectParams): void
}>()

// ---------------------------------------------------------
// Composable
// ---------------------------------------------------------
const {
  templates,
  selected,
  isLoading,
  error,

  loadTemplates,
  loadCategories,
  loadTemplate,
  compose,
} = usePortainer()

// ---------------------------------------------------------
// Local state
// ---------------------------------------------------------
const selectedId = ref<number | null>(props.modelValue ?? null)
const query = ref("")

// ---------------------------------------------------------
// Initial load
// ---------------------------------------------------------
onMounted(async () => {
  await loadTemplates()
  await loadCategories()

  if (props.modelValue != null) {
    await loadTemplate(props.modelValue)
  }
})

// ---------------------------------------------------------
// Watch for external modelValue changes
// ---------------------------------------------------------
watch(
  () => props.modelValue,
  async (id) => {
    selectedId.value = id ?? null
    if (id != null) {
      await loadTemplate(id)
    }
  },
)

// ---------------------------------------------------------
// Select template
// ---------------------------------------------------------
async function selectTemplate(id: number) {
  selectedId.value = id
  emit("update:modelValue", id)
  await loadTemplate(id)
}

const handleUseTemplate = async () => {
  if (selectedId.value) {
    const config = await compose(selectedId.value)
    const opts = { template: selected, config }
    emit("select", opts)
  }
}

// ---------------------------------------------------------
// Filter list (client-side)
// ---------------------------------------------------------
const filtered = computed(() => {
  const list = templates.value ?? []
  const q = query.value.toLowerCase()

  return list
    .filter((tpl) => {
      return (
        tpl.title.toLowerCase().includes(q) ||
        tpl.description.toLowerCase().includes(q) ||
        tpl.categories.some((c: string) => c.toLowerCase().includes(q))
      )
    })
    .sort((a, b) => a.title.localeCompare(b.title))
})
</script>

<template>
  <div class="flex flex-col bg-surface text-text">
    <div v-if="isLoading" class="p-4 text-sm text-text-muted">Loading templates…</div>
    <div v-if="error" class="p-4 text-sm text-danger">{{ error }}</div>

    <div class="flex flex-1">
      <!-- LEFT COLUMN -->
      <div
        class="w-full md:w-1/3 border-r border-border overflow-y-auto p-4 space-y-4 bg-surface"
        v-if="templates"
      >
        <h2 class="text-lg font-semibold text-text">Portainer Templates</h2>

        <div class="flex items-center gap-2">
          <input
            type="text"
            v-model="query"
            placeholder="Search templates…"
            class="w-full px-3 py-2 rounded border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            v-if="query"
            class="px-2 py-1 text-xs rounded border border-border bg-surface-hover"
            @click="query = ''"
          >
            Clear
          </button>
        </div>

        <div class="space-y-2" :style="{ height: `${maxHeight - 370}px`, overflow: `scroll` }">
          <div
            v-for="tpl in filtered"
            :key="tpl.id"
            class="p-3 rounded border border-border cursor-pointer transition-colors hover:bg-surface-hover"
            :class="{ 'bg-primary/10 border-primary text-primary': selectedId === tpl.id }"
            @click="selectTemplate(tpl.id)"
          >
            <div class="font-medium">{{ tpl.title }}</div>
            <div class="text-xs text-text-muted">Categories: {{ tpl.categories.join(", ") }}</div>
          </div>

          <div v-if="filtered.length === 0" class="text-xs text-text-muted p-2">
            No templates match "{{ query }}"
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div class="flex-1 overflow-y-auto p-6 bg-surface text-text" v-if="selected">
        <div class="space-y-4" :style="{ height: `${maxHeight - 280}px`, overflow: `auto` }">
          <h2 class="text-xl font-semibold">{{ selected.title }}</h2>

          <img
            v-if="selected.logo"
            :src="selected.logo"
            class="w-24 h-24 object-contain rounded bg-surface-hover p-2 border border-border"
          />

          <p class="text-sm text-text-muted">{{ selected.description }}</p>

          <div class="text-sm space-y-1">
            <div>
              <strong>Maintainer:</strong>
              <a :href="selected.maintainer" target="_blank">{{ selected.maintainer }}</a>
            </div>
            <div><strong>Image:</strong> {{ selected.image }}</div>
            <div><strong>Platform:</strong> {{ selected.platform }}</div>
            <div><strong>Categories:</strong> {{ selected.categories.join(", ") }}</div>
          </div>

          <GcButton variant="primary" @click="handleUseTemplate" :disabled="!selectedId">
            Use Template
          </GcButton>
        </div>
      </div>

      <div v-else class="flex-1 flex items-center justify-center text-text-muted bg-surface">
        Select a template to view details
      </div>
    </div>
  </div>
</template>
