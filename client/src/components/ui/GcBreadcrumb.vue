<script setup lang="ts">
const props = defineProps<{
  items: { label: string; href?: string; to?: string }[]
  separator?: string
}>()

const separator = props.separator ?? "/"
</script>

<template>
  <nav class="gc-breadcrumb text-sm text-muted" aria-label="Breadcrumb">
    <ol class="flex items-center gap-2">
      <li v-for="(item, i) in items" :key="i" class="flex items-center gap-2">
        <!-- Link -->
        <component
          :is="item.to ? 'RouterLink' : item.href ? 'a' : 'span'"
          :to="item.to"
          :href="item.href"
          class="text-text hover:text-primary transition-colors"
          :aria-current="i === items.length - 1 ? 'page' : null"
        >
          {{ item.label }}
        </component>

        <!-- Separator -->
        <span v-if="i < items.length - 1" class="text-muted select-none">
          {{ separator }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<style>
/* No scoped styles — keeps tokens working */
</style>
