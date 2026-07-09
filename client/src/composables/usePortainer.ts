// composables/usePortainer.ts

import { ref, computed } from "vue"
import { docksideClient } from "@/api"

export function usePortainer() {
  // ---------------------------------------------------------
  // State
  // ---------------------------------------------------------
  const templates = ref<any[]>([])
  const categories = ref<string[]>([])
  const searchResults = ref<any[]>([])
  const selected = ref<any | null>(null)

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ---------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------
  function setLoading(v: boolean) {
    isLoading.value = v
  }

  function setError(e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  }

  // ---------------------------------------------------------
  // Actions
  // ---------------------------------------------------------

  async function loadTemplates() {
    try {
      setLoading(true)
      templates.value = await docksideClient.portainer.getTemplates()
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  async function loadCategories() {
    try {
      setLoading(true)
      categories.value = await docksideClient.portainer.getCategories()
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  async function search(params: { q?: string; categories?: string[] | string }) {
    try {
      setLoading(true)
      searchResults.value = await docksideClient.portainer.searchTemplates(params)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  async function loadTemplate(id: number) {
    try {
      setLoading(true)
      selected.value = await docksideClient.portainer.getTemplate(id)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  async function compose(id: number) {
    try {
      setLoading(true)
      return await docksideClient.portainer.compose(id)
    } catch (e) {
      setError(e)
      return null
    } finally {
      setLoading(false)
    }
  }

  async function refresh() {
    try {
      setLoading(true)
      await docksideClient.portainer.refresh()
      await loadTemplates()
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------------------
  // Derived
  // ---------------------------------------------------------
  const hasResults = computed(() => searchResults.value.length > 0)
  const hasError = computed(() => !!error.value)

  // ---------------------------------------------------------
  // Public API
  // ---------------------------------------------------------
  return {
    // state
    templates,
    categories,
    searchResults,
    selected,
    isLoading,
    error,

    // derived
    hasResults,
    hasError,

    // actions
    loadTemplates,
    loadCategories,
    search,
    loadTemplate,
    compose,
    refresh,
  }
}
