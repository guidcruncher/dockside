<script setup lang="ts">
const props = defineProps<{
  message: string
  title?: string
}>()
</script>

<template>
  <GcCard padding="p-4" class="border border-red-400 bg-red-50 text-red-800 rounded-md">
    <GcStack direction="row" gap="3" class="items-start">
      <GcIcon name="AlertTriangle" class="text-red-600 mt-1" />

      <div class="space-y-1">
        <h3 class="font-semibold text-red-700">
          {{ props.title ?? "Error" }}
        </h3>

        <p class="text-sm leading-snug">
          {{ props.message }}
        </p>
      </div>
    </GcStack>
  </GcCard>
</template>
