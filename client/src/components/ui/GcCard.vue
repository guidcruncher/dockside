<script setup lang="ts">
defineProps<{ padding?: string }>()
</script>

<template>
  <div class="gc-card" :class="padding ?? 'p-4'">
    <slot />
  </div>
</template>
