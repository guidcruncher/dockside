// composables/useTemplates.ts

import { ref, computed } from "vue"
import type { Template, TemplateIndex } from "@/api"
import { docksideClient } from "@/api"

export function useTemplates() {
  // reactive state
  const index = ref<TemplateIndex | null>(null)
  const template = ref<Template | null>(null)

  const loading = ref(false)
  const error = ref<string | null>(null)

  // --- API: getIndex ---------------------------------------------------------
  async function getIndex() {
    loading.value = true
    error.value = null

    try {
      const result = await docksideClient.template.getIndex()
      index.value = result
      return result
    } catch (err: any) {
      error.value = err?.message ?? "Failed to load template index"
      throw err
    } finally {
      loading.value = false
    }
  }

  // --- API: getTemplate ------------------------------------------------------
  async function getTemplate(name: string) {
    loading.value = true
    error.value = null

    try {
      const result = await docksideClient.template.getTemplate(name)
      template.value = result
      return result
    } catch (err: any) {
      error.value = err?.message ?? `Failed to load template '${name}'`
      throw err
    } finally {
      loading.value = false
    }
  }

  // derived state
  const hasIndex = computed(() => index.value !== null)
  const hasTemplate = computed(() => template.value !== null)

  return {
    // state
    index,
    template,
    loading,
    error,

    // derived
    hasIndex,
    hasTemplate,

    // actions
    getIndex,
    getTemplate,
  }
}
