<script setup lang="ts">
const props = defineProps<{
  items: Array<{
    label: string
    value: string | number
    copyable?: boolean
  }>
}>()

function copy(text: string) {
  navigator.clipboard.writeText(text)
}
</script>

<template>
  <div class="gc-property-list">
    <div v-for="(item, i) in props.items" :key="i" class="gc-property-row">
      <div class="gc-property-label">
        {{ item.label }}
      </div>

      <div class="gc-property-value">
        {{ item.value }}
      </div>

      <div v-if="item.copyable" class="gc-property-actions">
        <button class="gc-property-copy" @click="copy(item.value.toString())">Copy</button>
      </div>
    </div>
  </div>
</template>
