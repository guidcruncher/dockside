<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue"

const theme = ref<"light" | "dark">("light")

function updateTheme() {
  theme.value = (document.documentElement.dataset.theme as "light" | "dark") || "light"
}

onMounted(() => {
  updateTheme()
  window.addEventListener("theme-change", updateTheme)
})

onBeforeUnmount(() => {
  window.removeEventListener("theme-change", updateTheme)
})
</script>

<template>
  <div
    class="gc-appshell"
    :class="{
      'gc-appshell-dark': theme === 'dark',
      'gc-appshell-light': theme === 'light',
    }"
  >
    <header v-if="$slots['navbar-left'] || $slots['navbar-right']" class="gc-appshell-navbar">
      <div v-if="$slots['navbar-left']" class="gc-navbar-left">
        <slot name="navbar-left" />
      </div>
      <div v-if="$slots['navbar-right']" class="gc-navbar-right">
        <slot name="navbar-right" />
      </div>
    </header>

    <main class="gc-appshell-content">
      <div class="gc-appshell-content-inner">
        <slot name="main" />
      </div>
    </main>
  </div>
</template>

<style>
.gc-appshell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: rgb(var(--gc-bg));
}

.gc-appshell-navbar {
  height: 56px;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid rgb(var(--gc-border));
  background: rgb(var(--gc-surface));
  z-index: 10;
}

.gc-navbar-left {
  display: flex;
  align-items: center;
  margin-right: auto;
}

.gc-navbar-right {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.gc-appshell-content {
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  /* padding remains here to keep scroll area constrained */
}

.gc-appshell-content-inner {
  min-width: 100%;
  width: fit-content;
  padding: 24px;
}
</style>
