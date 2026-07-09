<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue"

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  autoplay: { type: Boolean, default: false },
  interval: { type: Number, default: 4000 },
  loop: { type: Boolean, default: true },
})

const emit = defineEmits(["update:modelValue"])

const track = ref<HTMLElement | null>(null)
const slides = ref<HTMLElement[]>([])
const index = ref(props.modelValue)
let timer: any = null

const next = () => {
  if (index.value < slides.value.length - 1) index.value++
  else if (props.loop) index.value = 0
}

const prev = () => {
  if (index.value > 0) index.value--
  else if (props.loop) index.value = slides.value.length - 1
}

watch(index, (v: any) => emit("update:modelValue", v))

onMounted(() => {
  slides.value = Array.from(track.value!.children) as HTMLElement[]

  if (props.autoplay) {
    timer = setInterval(next, props.interval)
  }
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="gc-carousel">
    <div
      ref="track"
      class="gc-carousel-track"
      :style="{ transform: `translateX(-${index * 100}%)` }"
    >
      <slot />
    </div>

    <div class="gc-carousel-nav">
      <button class="gc-carousel-btn" @click="prev"><GcIcon name="ChevronLeft" /></button>
      <button class="gc-carousel-btn" @click="next"><GcIcon name="ChevronRight" /></button>
    </div>

    <div class="gc-carousel-dots">
      <button
        v-for="(_, i) in slides.length"
        :key="i"
        class="gc-carousel-dot"
        :class="{ 'gc-carousel-dot-active': i === index }"
        @click="index = i"
      />
    </div>
  </div>
</template>
