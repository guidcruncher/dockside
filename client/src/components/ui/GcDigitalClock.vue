<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue"

const props = defineProps<{
  timezone?: string
  showSeconds?: boolean
  label?: string
}>()

const hours = ref("00")
const minutes = ref("00")
const seconds = ref("00")

function update() {
  const now = new Date()

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: props.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const parts = formatter.formatToParts(now)
  hours.value = parts.find((p) => p.type === "hour")?.value ?? "00"
  minutes.value = parts.find((p) => p.type === "minute")?.value ?? "00"
  seconds.value = parts.find((p) => p.type === "second")?.value ?? "00"
}

let interval: number

onMounted(() => {
  update()
  interval = window.setInterval(update, 1000)
})

onBeforeUnmount(() => {
  clearInterval(interval)
})
</script>

<template>
  <div class="gc-clock flex flex-col items-center gap-1">
    <div class="flex items-end gap-2 text-5xl font-bold text-text">
      <span>{{ hours }}</span>
      <span>:</span>
      <span>{{ minutes }}</span>

      <template v-if="showSeconds">
        <span class="text-2xl opacity-70 pb-1">:</span>
        <span class="text-2xl opacity-70 pb-1">{{ seconds }}</span>
      </template>
    </div>

    <div v-if="label" class="text-sm text-muted tracking-wide uppercase">
      {{ label }}
    </div>
  </div>
</template>

<style>
.gc-clock {
  font-family: var(--gc-font-mono, monospace);
}
</style>
