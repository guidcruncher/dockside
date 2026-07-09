<!-- src/components/gc/GcEmptyState.vue -->
<script setup lang="ts">
interface Props {
  title: string
  description?: string
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: "",
  icon: "info",
})
</script>

<template>
  <div class="w-full flex flex-col items-center text-center py-10 px-4 text-gray-600">
    <!-- Icon -->
    <GcIcon v-if="icon" :name="icon" class="w-12 h-12 text-gray-400 mb-4" />

    <!-- Title -->
    <h2 class="text-lg font-semibold text-gray-800">
      {{ title }}
    </h2>

    <!-- Description -->
    <p v-if="description" class="text-sm text-gray-500 mt-1 max-w-md">
      {{ description }}
    </p>

    <!-- Optional action slot -->
    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>
