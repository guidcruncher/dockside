<script setup lang="ts">
import { ref, watch } from "vue"
import YAML from "yaml"
import type { ComposeConfig } from "@/types"
import { useYamlNormalizer } from "../composables/useYamlNormalizer"

const { normalizeYamlObject } = useYamlNormalizer()

const props = defineProps<{
  modelValue: ComposeConfig
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: ComposeConfig): void
}>()

// Modal visibility
const showImport = ref(false)
const showExport = ref(false)

// Textareas
const importText = ref("")
const exportText = ref("")

// Error handling
const error = ref<string | null>(null)

// ---------------------------------------------------------
// Keep exportText synced with latest modelValue
// ---------------------------------------------------------
watch(
  () => props.modelValue,
  (v: any) => {
    if (showExport.value) {
      exportText.value = YAML.stringify(v)
    }
  },
  { deep: true },
)

function openImport() {
  importText.value = ""
  error.value = null
  showImport.value = true
}

function openExport() {
  error.value = null
  exportText.value = YAML.stringify(props.modelValue)
  showExport.value = true
}

function performImport() {
  try {
    const parsed = YAML.parse(importText.value)
    const config = normalizeYamlObject(parsed)
    emit("update:modelValue", config)
    showImport.value = false
  } catch (e: any) {
    error.value = e.message
  }
}
</script>

<template>
  <GcCard padding="p-4 space-y-6">
    <div class="space-y-1">
      <h2 class="text-base font-semibold">YAML Import / Export</h2>
      <p class="text-sm opacity-80">Import or export docker-compose.yml</p>
    </div>

    <GcStack direction="row" gap="4">
      <GcButton variant="primary" @click="openImport"> Import YAML </GcButton>
      <GcButton variant="default" @click="openExport"> Export YAML </GcButton>
    </GcStack>

    <!-- IMPORT MODAL -->
    <GcModal v-model="showImport">
      <template #header>
        <h3 class="text-lg font-semibold">Import YAML</h3>
      </template>

      <GcStack direction="column" gap="4">
        <GcTextarea
          placeholder="Paste docker-compose YAML"
          rows="16"
          :model-value="importText"
          @update:model-value="(v: any) => (importText = v)"
        />

        <div v-if="error" class="text-red-500 text-sm">
          {{ error }}
        </div>
      </GcStack>

      <template #footer>
        <GcStack direction="row" gap="3">
          <GcButton variant="default" @click="showImport = false"> Cancel </GcButton>
          <GcButton variant="primary" @click="performImport"> Import </GcButton>
        </GcStack>
      </template>
    </GcModal>

    <!-- EXPORT MODAL -->
    <GcModal v-model="showExport">
      <template #header>
        <h3 class="text-lg font-semibold">Export YAML</h3>
      </template>

      <GcTextarea
        placeholder="docker-compose.yml"
        rows="16"
        :model-value="exportText"
        @update:model-value="(v: any) => (exportText = v)"
      />

      <template #footer>
        <GcButton variant="primary" @click="showExport = false"> Close </GcButton>
      </template>
    </GcModal>
  </GcCard>
</template>
