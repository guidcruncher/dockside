<script setup lang="ts">
import { ref, computed, watch } from "vue"

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits(["update:modelValue"])

// Internal HSL + Alpha state
const hue = ref(0)
const saturation = ref(100)
const lightness = ref(50)
const alpha = ref(1)

// Convert HSL → RGB
function hslToRgb(h: number, s: number, l: number) {
  s /= 100
  l /= 100

  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))

  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  }
}

// RGB → HSL
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h *= 60
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

// Parse incoming modelValue (HEX or RGBA)
function parseColor(input: string) {
  if (input.startsWith("rgba")) {
    const [r, g, b, a] = input
      .replace(/[rgba() ]/g, "")
      .split(",")
      .map(Number)
    return { ...rgbToHsl(r, g, b), a }
  }

  // HEX
  const hex = input.replace("#", "")
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1

  return { ...rgbToHsl(r, g, b), a }
}

// Sync external → internal
watch(
  () => props.modelValue,
  (val) => {
    if (!val) return
    const { h, s, l, a } = parseColor(val)
    hue.value = h
    saturation.value = s
    lightness.value = l
    alpha.value = a
  },
  { immediate: true },
)

// Emit RGBA
function updateColor() {
  const { r, g, b } = hslToRgb(hue.value, saturation.value, lightness.value)
  emit("update:modelValue", `rgba(${r}, ${g}, ${b}, ${alpha.value})`)
}

// TS‑safe HEX input
function onHexInput(e: Event) {
  const target = e.target as HTMLInputElement | null
  if (!target) return
  emit("update:modelValue", target.value)
}

// -------------------------------
// Saturation/Lightness Panel
// -------------------------------
const panel = ref<HTMLElement | null>(null)

function onPanelDown(e: MouseEvent | TouchEvent) {
  const el = panel.value
  if (!el) return

  const rect = el.getBoundingClientRect()

  const move = (ev: MouseEvent | TouchEvent) => {
    const x = "touches" in ev ? ev.touches[0].clientX : (ev as MouseEvent).clientX
    const y = "touches" in ev ? ev.touches[0].clientY : (ev as MouseEvent).clientY

    const px = Math.min(Math.max(0, x - rect.left), rect.width)
    const py = Math.min(Math.max(0, y - rect.top), rect.height)

    saturation.value = Math.round((px / rect.width) * 100)
    lightness.value = Math.round(100 - (py / rect.height) * 100)

    updateColor()
  }

  const up = () => {
    window.removeEventListener("mousemove", move)
    window.removeEventListener("mouseup", up)
    window.removeEventListener("touchmove", move)
    window.removeEventListener("touchend", up)
  }

  window.addEventListener("mousemove", move)
  window.addEventListener("mouseup", up)
  window.addEventListener("touchmove", move)
  window.addEventListener("touchend", up)

  move(e)
}

const panelCursorStyle = computed(() => ({
  left: `${saturation.value}%`,
  top: `${100 - lightness.value}%`,
}))
</script>

<template>
  <div class="gc-colorpicker space-y-3">
    <!-- Preview with checkerboard -->
    <div class="relative w-full h-10 rounded border border-border overflow-hidden">
      <div class="absolute inset-0 bg-[url('/checkerboard.png')] opacity-40"></div>
      <div
        class="absolute inset-0"
        :style="{
          backgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`,
        }"
      ></div>
    </div>

    <!-- Saturation/Lightness Panel -->
    <div
      ref="panel"
      class="relative w-full h-40 rounded overflow-hidden cursor-crosshair"
      :style="{
        background: `hsl(${hue}, 100%, 50%)`,
      }"
      @mousedown="onPanelDown"
      @touchstart.prevent="onPanelDown"
    >
      <!-- White gradient -->
      <div class="absolute inset-0 bg-gradient-to-r from-white"></div>
      <!-- Black gradient -->
      <div class="absolute inset-0 bg-gradient-to-t from-black"></div>

      <!-- Cursor -->
      <div
        class="absolute w-4 h-4 rounded-full border border-white shadow"
        :style="panelCursorStyle"
      ></div>
    </div>

    <!-- Hue slider -->
    <div>
      <label class="text-xs text-muted-foreground">Hue</label>
      <input type="range" min="0" max="360" v-model="hue" @input="updateColor" class="w-full" />
    </div>

    <!-- Alpha slider -->
    <div>
      <label class="text-xs text-muted-foreground">Alpha</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        v-model="alpha"
        @input="updateColor"
        class="w-full"
      />
    </div>

    <!-- HEX input -->
    <div>
      <label class="text-xs text-muted-foreground">HEX</label>
      <input type="text" class="gc-input w-full" :value="modelValue" @input="onHexInput" />
    </div>
  </div>
</template>

<style scoped>
.gc-colorpicker input[type="range"] {
  @apply cursor-pointer;
}
</style>
