// src/composables/useTheme.ts
import { ref, onMounted, onBeforeUnmount } from "vue"

export type ThemeMode = "light" | "dark" | "system"

export function useTheme() {
  const theme = ref<ThemeMode>("light")

  function applyTheme(mode: ThemeMode) {
    theme.value = mode
    localStorage.setItem("gc-theme", mode)

    if (mode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      document.documentElement.dataset.theme = prefersDark ? "dark" : "light"
    } else {
      document.documentElement.dataset.theme = mode
    }

    window.dispatchEvent(new Event("theme-change"))
  }

  function handleSystemChange(e: MediaQueryListEvent) {
    if (theme.value === "system") {
      document.documentElement.dataset.theme = e.matches ? "dark" : "light"
      window.dispatchEvent(new Event("theme-change"))
    }
  }

  onMounted(() => {
    const saved = (localStorage.getItem("gc-theme") as ThemeMode) || "light"
    applyTheme(saved)

    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    mq.addEventListener("change", handleSystemChange)
  })

  onBeforeUnmount(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    mq.removeEventListener("change", handleSystemChange)
  })

  return {
    theme,
    applyTheme,
  }
}
