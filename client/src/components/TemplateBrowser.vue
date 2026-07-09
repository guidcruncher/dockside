<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { useTemplates } from "@/composables/useTemplates"
import type { ComposeConfig } from "@/types"
import { useWindowSize } from "@/composables/useWindowSize"
const { maxHeight } = useWindowSize()

const props = defineProps<{
  modelValue?: string | null
}>()

interface SelectParams {
  template: any
  config: ComposeConfig
}

const emit = defineEmits<{
  (e: "update:modelValue", key: string | null): void
  (e: "select", opts: SelectParams): void
}>()

const { index, template, loading, error, getIndex, getTemplate, compose } = useTemplates()

const selected = ref<string | null>(props.modelValue ?? null)
const query = ref("")

onMounted(() => {
  getIndex()

  if (props.modelValue) {
    getTemplate(props.modelValue)
  }
})

watch(
  () => props.modelValue,
  (key) => {
    selected.value = key ?? null
    if (key) getTemplate(key)
  },
)

function selectTemplate(key: string) {
  selected.value = key
  emit("update:modelValue", key)
  getTemplate(key)
}

const handleUseTemplate = async () => {
  if (selected.value) {
    const config = await compose(selected.value)
    const opts = { template: template.value, config }
    emit("select", opts)
  }
}

//
// Filter list
//
const filtered = computed(() => {
  if (!index.value) return []

  const q = query.value.toLowerCase()

  return Object.entries(index.value)
    .filter(([key, entry]) => {
      return key.toLowerCase().includes(q) || entry.name.toLowerCase().includes(q)
    })
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
})
</script>

<template>
  <div class="flex flex-col bg-surface text-text">
    <div v-if="loading" class="p-4 text-sm text-text-muted">Loading templates…</div>
    <div v-if="error" class="p-4 text-sm text-danger">{{ error }}</div>

    <div class="flex flex-1">
      <!-- LEFT COLUMN -->
      <div
        class="w-full md:w-1/3 border-r border-border overflow-y-auto p-4 space-y-4 bg-surface"
        v-if="index"
      >
        <h2 class="text-lg font-semibold text-text">Templates</h2>

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
            v-for="[key, entry] in filtered"
            :key="key"
            class="p-3 rounded border border-border cursor-pointer transition-colors hover:bg-surface-hover"
            :class="{ 'bg-primary/10 border-primary text-primary': selected === key }"
            @click="selectTemplate(key)"
          >
            <div class="font-medium">{{ entry.name }}</div>
            <div class="text-xs text-text-muted">Version {{ entry.version }}</div>
          </div>

          <div v-if="filtered.length === 0" class="text-xs text-text-muted p-2">
            No templates match "{{ query }}"
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div class="flex-1 overflow-y-auto p-6 bg-surface text-text" v-if="template">
        <div class="space-y-4" :style="{ height: `${maxHeight - 370}px`, overflow: `auto` }">
          <h2 class="text-xl font-semibold">{{ template.name }}</h2>

          <img
            v-if="template.logo"
            :src="template.logo"
            class="w-24 h-24 object-contain rounded bg-surface-hover p-2 border border-border"
          />

          <p class="text-sm text-text-muted">{{ template.description }}</p>

          <div class="text-sm space-y-1">
            <div><strong>Author:</strong> {{ template.author }}</div>
            <div><strong>License:</strong> {{ template.license }}</div>
            <div>
              <strong>Website:</strong>
              <a :href="template.weburl" target="_blank" class="text-primary">
                {{ template.weburl }}
              </a>
            </div>
            <div>
              <strong>Docs:</strong>
              <a :href="template.docsurl" target="_blank" class="text-primary">
                {{ template.docsurl }}
              </a>
            </div>
          </div>

          <GcButton variant="primary" @click="handleUseTemplate" :disabled="!selected">
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
