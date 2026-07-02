import { ref, computed, onMounted, onUnmounted } from "vue"

export function useWindowSize() {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)
  const maxWidth = ref(0)
  const maxHeight = ref(0)

  const getMaxWidth = () =>
    Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth,
    )

  const getMaxHeight = () =>
    Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight,
    )

  const updateSize = () => {
    maxWidth.value = getMaxWidth()
    maxHeight.value = getMaxHeight()
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => {
    window.addEventListener("resize", updateSize)
    updateSize() // Ensure initial run
  })

  onUnmounted(() => {
    window.removeEventListener("resize", updateSize)
  })

  return { width, height, maxWidth, maxHeight, isDesktop: computed(() => width.value >= 1280) }
}
