<script setup lang="ts">
import { ref, computed } from "vue"
import { Sun, Moon, Monitor } from "@lucide/vue"
import { useTheme } from "@/composables/useTheme"

const { theme, applyTheme } = useTheme()
const isOpen = ref(false)

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

const currentOption = computed(() => options.find((o) => o.value === theme.value) ?? options[2])

const selectTheme = (value: string) => {
  applyTheme(value as any)
  isOpen.value = false
}
</script>

<template>
  <div class="relative inline-block">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center justify-center p-2 bg-navbar-bg hover:bg-navbar-bg focus:bg-navbar-bg active:bg-navbar-bg text-navbar~text transition-none"
    >
      <component :is="currentOption.icon" class="w-5 h-5" />
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-32 bg-surface border border-border rounded-md shadow-soft z-50 py-1 origin-top-right"
    >
      <button
        v-for="option in options"
        :key="option.value"
        @click="selectTheme(option.value)"
        class="flex items-center gap-2 w-full px-3 py-2 text-sm text-text transition-colors hover:bg-muted-soft"
      >
        <component :is="option.icon" class="w-4 h-4" />
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
