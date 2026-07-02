<script setup lang="ts">
defineProps<{ text: string }>()
</script>

<template>
  <span class="gc-tooltip">
    <slot />
    <span class="gc-tooltip-content">{{ text }}</span>
  </span>
</template>
