<script setup lang="ts">
import { ref, provide, onMounted, onBeforeUnmount } from "vue"

const open = ref(false)

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

provide("gc-dropdown-open", open)
provide("gc-dropdown-close", close)

const dropdownRef = ref<HTMLElement | null>(null)

/* CLICK OUTSIDE */
function onClickOutside(e: MouseEvent) {
  if (!dropdownRef.value) return
  if (!dropdownRef.value.contains(e.target as Node)) close()
}

onMounted(() => document.addEventListener("click", onClickOutside))
onBeforeUnmount(() => document.removeEventListener("click", onClickOutside))

/* ESCAPE KEY */
function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") close()
}

onMounted(() => document.addEventListener("keydown", onKey))
onBeforeUnmount(() => document.removeEventListener("keydown", onKey))
</script>

<template>
  <div class="gc-dropdown" ref="dropdownRef">
    <!-- FIXED TRIGGER -->
    <div class="gc-dropdown-trigger" @click="toggle">
      <slot name="trigger" />
    </div>

    <!-- MENU -->
    <transition
      enter-from-class="gc-dropdown-enter-from"
      enter-to-class="gc-dropdown-enter-to"
      enter-active-class="gc-dropdown-enter-active"
      leave-from-class="gc-dropdown-leave-from"
      leave-to-class="gc-dropdown-leave-to"
      leave-active-class="gc-dropdown-leave-active"
    >
      <div v-if="open" class="gc-dropdown-menu">
        <slot />
      </div>
    </transition>
  </div>
</template>
