<script setup lang="ts">
import { useWindowSize } from "@/composables/useWindowSize"
import type { ProxyConfig } from "@/api"
import { ref } from "vue"

const props = defineProps<{ modelValue: any }>()
const emit = defineEmits<{
  (e: "update:modelValue", value: any): void
}>()

const { maxHeight } = useWindowSize()

function update() {
  emit("update:modelValue", proxy.value)
}

function onInput(e: Event) {
  const el = e.target as HTMLTextAreaElement
  proxy.value.config = el.value
  update()
}

// ---------------------------------------------------------
// LOCAL WRAPPER — never use props.proxy directly
// ---------------------------------------------------------
const proxy = ref<ProxyConfig>(props.modelValue)
</script>

<template>
  <GcCard>
    <div>
      <h3 class="text-sm font-medium">Caddy Proxy Configuration</h3>
      <textarea
        placeholder="Project Proxy configuration"
        class="w-full h-[350px] p-3 rounded-md border border-border bg-surface text-text text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        :style="{
          height: `${maxHeight - 460}px`,
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \'Liberation Mono\', \'Courier New\', monospace',
        }"
        :value="proxy.config"
        @input="onInput"
      />
    </div>
  </GcCard>
</template>
