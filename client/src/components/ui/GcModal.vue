<script setup lang="ts">
import { watch, onMounted, onBeforeUnmount } from "vue"

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(["update:modelValue"])

function close() {
  emit("update:modelValue", false)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") close()
}

function lockScroll() {
  document.body.style.overflow = "hidden"
}

function unlockScroll() {
  document.body.style.overflow = ""
}

watch(
  () => props.modelValue,
  (open) => {
    open ? lockScroll() : unlockScroll()
  },
)

onMounted(() => {
  document.addEventListener("keydown", onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown)
  unlockScroll()
})
</script>

<template>
  <transition
    enter-active-class="gc-modal-enter-active"
    enter-from-class="gc-modal-enter"
    leave-active-class="gc-modal-leave-active"
    leave-to-class="gc-modal-leave"
  >
    <div v-if="modelValue" class="gc-modal-backdrop" @click.self="close">
      <div class="gc-modal-panel">
        <slot name="header" />

        <div class="mt-4">
          <slot />
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </transition>
</template>
