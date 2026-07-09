<script setup lang="ts">
import { ref, watch, nextTick } from "vue"
import YAML from "yaml"
import { useWindowSize } from "@/composables/useWindowSize"

// Lucide icons
import { Scissors, Copy, ClipboardPaste } from "@lucide/vue"

const props = defineProps<{ modelValue: any }>()

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void
}>()

const yamlText = ref(YAML.stringify(props.modelValue, { indent: 2 }))
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const { maxHeight } = useWindowSize()

// Cursor position state
const cursorRow = ref(1)
const cursorCol = ref(1)

// ---------------------------------------------------------
// Cursor position tracking
// ---------------------------------------------------------
function updateCursorPosition() {
  const el = textareaRef.value
  if (!el) return

  const pos = el.selectionStart
  const text = el.value

  cursorRow.value = text.slice(0, pos).split("\n").length

  const lastNewline = text.lastIndexOf("\n", pos - 1)
  cursorCol.value = pos - (lastNewline + 1)
}

// ---------------------------------------------------------
// Toolbar actions
// ---------------------------------------------------------
function cutText() {
  const el = textareaRef.value
  if (!el) return
  el.focus()
  document.execCommand("cut")
  yamlText.value = el.value
  updateCursorPosition()
}

function copyText() {
  const el = textareaRef.value
  if (!el) return
  el.focus()
  document.execCommand("copy")
}

function pasteText() {
  const el = textareaRef.value
  if (!el) return
  el.focus()
  document.execCommand("paste")
  yamlText.value = el.value
  updateCursorPosition()
}

// ---------------------------------------------------------
// Sync external modelValue → textarea (preserve cursor + scroll)
// ---------------------------------------------------------
watch(
  () => props.modelValue,
  async (v) => {
    const el = textareaRef.value
    if (!el) {
      yamlText.value = YAML.stringify(v, { indent: 2 })
      return
    }

    const start = el.selectionStart
    const end = el.selectionEnd
    const scrollTop = el.scrollTop

    yamlText.value = YAML.stringify(v, { indent: 2 })

    await nextTick()
    el.setSelectionRange(start, end)
    el.scrollTop = scrollTop

    updateCursorPosition()
  },
  { deep: true },
)

// ---------------------------------------------------------
// Sync textarea → external modelValue
// ---------------------------------------------------------
function onInput(e: Event) {
  const el = e.target as HTMLTextAreaElement
  yamlText.value = el.value

  updateCursorPosition()

  try {
    const parsed = YAML.parse(el.value)
    emit("update:modelValue", { patchType: "full", patch: parsed })
  } catch {
    // ignore invalid YAML
  }
}
</script>

<template>
  <div class="w-full space-y-2">
    <!-- Toolbar -->
    <GcToolbar>
      <GcToolbarButton @click="cutText"> <Scissors class="w-4 h-4" /> Cut </GcToolbarButton>

      <GcToolbarButton @click="copyText"> <Copy class="w-4 h-4" /> Copy </GcToolbarButton>

      <GcToolbarButton @click="pasteText">
        <ClipboardPaste class="w-4 h-4" /> Paste
      </GcToolbarButton>
    </GcToolbar>

    <!-- Textarea -->
    <textarea
      ref="textareaRef"
      class="w-full h-[350px] p-3 rounded-md border border-border bg-surface text-text text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
      :style="{
        height: `${maxHeight - 460}px`,
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \'Liberation Mono\', \'Courier New\', monospace',
      }"
      :value="yamlText"
      @input="onInput"
      @keyup="updateCursorPosition"
      @click="updateCursorPosition"
      @mouseup="updateCursorPosition"
    />

    <!-- Row/Col display -->
    <div class="text-xs text-gray-500">Row {{ cursorRow }}, Col {{ cursorCol }}</div>
  </div>
</template>
