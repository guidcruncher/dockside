<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue"
import Fuse from "fuse.js"
import { useCommands } from "../../composables/useCommands"

const open = ref(false)
const query = ref("")
const activeIndex = ref(0)

const { commands } = useCommands()

// Build Fuse index reactively
const fuse = computed(() => {
  return new Fuse(commands.value, {
    keys: ["label"],
    threshold: 0.3,
  })
})

// Filtered results
const filtered = computed(() => {
  if (!query.value) return commands.value
  return fuse.value.search(query.value).map((r) => r.item)
})

// Trigger a command
function trigger(cmd: any) {
  cmd.action()
  closePalette()
}

// Open palette
async function openPalette() {
  open.value = true
  query.value = ""
  activeIndex.value = 0

  await nextTick()
  const input = document.getElementById("gc-cmd-input") as HTMLInputElement
  input?.focus()
}

// Close palette
function closePalette() {
  open.value = false
  query.value = ""
  activeIndex.value = 0
}

// Keyboard navigation
function onKey(e: KeyboardEvent) {
  if (!open.value) return

  if (e.key === "ArrowDown") {
    e.preventDefault()
    if (filtered.value.length > 0) {
      activeIndex.value = (activeIndex.value + 1) % filtered.value.length
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault()
    if (filtered.value.length > 0) {
      activeIndex.value = (activeIndex.value - 1 + filtered.value.length) % filtered.value.length
    }
  } else if (e.key === "Enter") {
    const cmd = filtered.value[activeIndex.value]
    if (cmd) trigger(cmd)
  } else if (e.key === "Escape") {
    closePalette()
  }
}

// Global ⌘K / Ctrl+K
function globalKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault()
    openPalette()
  }
}

onMounted(() => window.addEventListener("keydown", globalKey))
onUnmounted(() => window.removeEventListener("keydown", globalKey))
</script>

<template>
  <button @click="openPalette" id="command-palette-trigger">
    <GcIcon name="Command" />
  </button>

  <div v-if="open" class="gc-cmd-overlay" tabindex="0" @keydown="onKey" @click.self="closePalette">
    <div class="gc-cmd-panel">
      <input id="gc-cmd-input" v-model="query" class="gc-cmd-input" placeholder="Type a command…" />

      <ul class="gc-cmd-list">
        <li
          v-for="(cmd, i) in filtered"
          :key="cmd.id"
          class="gc-cmd-item"
          :class="{ 'gc-cmd-item-active': i === activeIndex }"
          @click="trigger(cmd)"
        >
          {{ cmd.label }}
        </li>

        <li v-if="filtered.length === 0" class="gc-cmd-empty">No commands found</li>
      </ul>
    </div>
  </div>
</template>
