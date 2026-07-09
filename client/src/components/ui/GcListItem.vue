<script setup lang="ts">
const props = defineProps<{
  icon?: string
  title: string
  description?: string
  clickable?: boolean
}>()

const emit = defineEmits(["click"])
</script>

<template>
  <div
    class="flex items-start gap-3 p-3 rounded-md transition"
    :class="{
      'cursor-pointer hover:bg-muted-soft active:bg-muted': props.clickable,
    }"
    @click="props.clickable && emit('click')"
  >
    <GcIcon v-if="props.icon" :name="props.icon" class="text-muted-foreground mt-1" />

    <div class="flex-1 space-y-0.5">
      <div class="font-medium text-sm">
        {{ props.title }}
      </div>

      <div v-if="props.description" class="text-xs opacity-70 leading-snug">
        {{ props.description }}
      </div>
    </div>

    <div class="flex items-center">
      <slot name="action" />
    </div>
  </div>
</template>
