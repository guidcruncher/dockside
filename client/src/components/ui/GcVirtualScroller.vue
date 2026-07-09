<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"

const props = withDefaults(
  defineProps<{
    items: any[]
    itemSize: number
    loadMore: () => Promise<void> | void
    loading?: boolean
    disabled?: boolean
    direction?: "vertical" | "horizontal"
    overscan?: number
  }>(),
  {
    direction: "vertical",
    overscan: 6,
    loading: false,
    disabled: false,
  },
)

const container = ref<HTMLElement | null>(null)
const sentinel = ref<HTMLElement | null>(null)

const scrollPos = ref(0)
const isHorizontal = computed(() => props.direction === "horizontal")

// ----------------------------
// SCROLL POSITION TRACKING
// ----------------------------
function onScroll() {
  if (!container.value) return
  scrollPos.value = isHorizontal.value ? container.value.scrollLeft : container.value.scrollTop
}

onMounted(() => container.value?.addEventListener("scroll", onScroll))
onBeforeUnmount(() => container.value?.removeEventListener("scroll", onScroll))

// ----------------------------
// VIRTUALIZATION
// ----------------------------
const totalSize = computed(() => props.items.length * props.itemSize)

const startIndex = computed(() => Math.floor(scrollPos.value / props.itemSize))

const endIndex = computed(() =>
  Math.min(
    props.items.length,
    startIndex.value +
      Math.ceil(
        (isHorizontal.value
          ? (container.value?.clientWidth ?? 0)
          : (container.value?.clientHeight ?? 0)) / props.itemSize,
      ) +
      props.overscan,
  ),
)

const visibleItems = computed(() =>
  props.items.slice(Math.max(0, startIndex.value - props.overscan), endIndex.value),
)

const offset = computed(() => Math.max(0, (startIndex.value - props.overscan) * props.itemSize))

// ----------------------------
// LAZY LOADING (IntersectionObserver)
// ----------------------------
let observer: IntersectionObserver | null = null

function createObserver() {
  if (!sentinel.value) return

  observer = new IntersectionObserver(async (entries) => {
    const entry = entries[0]

    if (entry.isIntersecting && !props.loading && !props.disabled) {
      await props.loadMore()
    }
  })

  observer.observe(sentinel.value)
}

onMounted(createObserver)
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    ref="container"
    class="gc-virtual-scroller relative"
    :class="{
      'overflow-y-auto overflow-x-hidden': !isHorizontal,
      'overflow-x-auto overflow-y-hidden whitespace-nowrap': isHorizontal,
    }"
  >
    <!-- Scrollable space -->
    <div
      :style="{
        height: !isHorizontal ? totalSize + 'px' : '100%',
        width: isHorizontal ? totalSize + 'px' : '100%',
      }"
    ></div>

    <!-- Rendered items -->
    <div
      class="absolute top-0 left-0"
      :style="{
        transform: isHorizontal ? `translateX(${offset}px)` : `translateY(${offset}px)`,
      }"
    >
      <div
        v-for="(item, i) in visibleItems"
        :key="item.id ?? i"
        :style="{
          height: !isHorizontal ? props.itemSize + 'px' : '100%',
          width: isHorizontal ? props.itemSize + 'px' : '100%',
        }"
        class="gc-virtual-item"
      >
        <slot :item="item" />
      </div>
    </div>

    <!-- Lazy load sentinel -->
    <div
      ref="sentinel"
      :class="{
        'h-10 w-full': !isHorizontal,
        'w-10 h-full inline-block align-top': isHorizontal,
      }"
    ></div>

    <div v-if="loading" class="py-4 text-center text-muted">Loading…</div>
  </div>
</template>

<style>
/* No scoped styles — keeps tokens working */
</style>
