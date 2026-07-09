<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(
  defineProps<{
    page: number
    pageSize: number
    total: number
    showEdges?: boolean
  }>(),
  { showEdges: true },
)

const emit = defineEmits<{
  (e: "update:page", value: number): void
}>()

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

function setPage(p: number) {
  if (p < 1 || p > pageCount.value || p === props.page) return
  emit("update:page", p)
}

const pages = computed(() => {
  const max = pageCount.value
  const current = props.page
  const windowSize = 1
  const items: (number | "ellipsis")[] = []

  const start = Math.max(2, current - windowSize)
  const end = Math.min(max - 1, current + windowSize)

  items.push(1)

  if (start > 2) items.push("ellipsis")

  for (let i = start; i <= end; i++) items.push(i)

  if (end < max - 1) items.push("ellipsis")

  if (max > 1) items.push(max)

  return items
})
</script>

<template>
  <nav class="gc-pagination" aria-label="Pagination">
    <button
      class="gc-page-btn"
      :class="{ 'gc-page-btn-disabled': page === 1 }"
      @click="setPage(1)"
      v-if="showEdges"
    >
      «
    </button>

    <button
      class="gc-page-btn"
      :class="{ 'gc-page-btn-disabled': page === 1 }"
      @click="setPage(page - 1)"
    >
      ‹
    </button>

    <div class="gc-pagination-list">
      <template v-for="(item, idx) in pages" :key="idx">
        <span v-if="item === 'ellipsis'" class="gc-page-ellipsis"> … </span>

        <button
          v-else
          class="gc-page-btn"
          :class="{ 'gc-page-btn-active': item === page }"
          @click="setPage(item as number)"
        >
          {{ item }}
        </button>
      </template>
    </div>

    <button
      class="gc-page-btn"
      :class="{ 'gc-page-btn-disabled': page === pageCount }"
      @click="setPage(page + 1)"
    >
      ›
    </button>

    <button
      class="gc-page-btn"
      :class="{ 'gc-page-btn-disabled': page === pageCount }"
      @click="setPage(pageCount)"
      v-if="showEdges"
    >
      »
    </button>
  </nav>
</template>
