<script setup lang="ts">
const props = defineProps<{
  divided?: boolean
}>()
</script>

<template>
  <div
    class="flex flex-col"
    :class="{
      'divide-y divide-muted-soft': props.divided,
    }"
  >
    <slot />
  </div>
</template>
