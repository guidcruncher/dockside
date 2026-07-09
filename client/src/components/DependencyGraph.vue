<script setup lang="ts">
import { ref, watch, computed } from "vue"

interface Props {
  graph: Record<string, string[]>
  size?: "sm" | "md" | "lg"
}

const props = defineProps<Props>()
const size = computed(() => props.size ?? "md")

const sizes = {
  sm: { w: 120, h: 40, gapX: 60, gapY: 40 },
  md: { w: 160, h: 50, gapX: 80, gapY: 50 },
  lg: { w: 220, h: 60, gapX: 120, gapY: 60 },
}

const cfg = computed(() => sizes[size.value])

interface Node {
  name: string
  x: number
  y: number
}
interface Edge {
  from: string
  to: string
}

const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

function rebuild() {
  const g = props.graph
  const names = Object.keys(g)
  nodes.value = names.map((name, i) => ({
    name,
    x: i * (cfg.value.w + cfg.value.gapX),
    y: 0,
  }))

  const out: Edge[] = []
  for (const [svc, deps] of Object.entries(g)) {
    for (const dep of deps) {
      out.push({ from: svc, to: dep })
    }
  }
  edges.value = out
}

watch(() => props.graph, rebuild, { immediate: true })

const svgWidth = computed(
  () => nodes.value.length * (cfg.value.w + cfg.value.gapX) - cfg.value.gapX,
)
const svgHeight = computed(() => cfg.value.h)

function nodeX(name: string): number {
  const n = nodes.value.find((n) => n.name === name)
  return n ? n.x : 0
}
</script>

<template>
  <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="w-full h-auto overflow-visible">
    <line
      v-for="edge in edges"
      :key="edge.from + edge.to"
      :x1="nodeX(edge.from) + cfg.w"
      :y1="cfg.h / 2"
      :x2="nodeX(edge.to)"
      :y2="cfg.h / 2"
      style="stroke: rgb(var(--gc-border))"
      stroke-width="2"
      marker-end="url(#arrow)"
    />

    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="3" orient="auto">
        <path d="M0,0 L0,6 L9,3 z" style="fill: rgb(var(--gc-border))" />
      </marker>
    </defs>

    <g v-for="node in nodes" :key="node.name" :transform="`translate(${node.x}, 0)`">
      <rect
        :width="cfg.w"
        :height="cfg.h"
        rx="6"
        style="fill: rgb(var(--gc-surface)); stroke: rgb(var(--gc-border))"
        stroke-width="2"
      />
      <text
        :x="cfg.w / 2"
        :y="cfg.h / 2"
        dominant-baseline="middle"
        text-anchor="middle"
        style="fill: rgb(var(--gc-text)); font-family: Inter, sans-serif; pointer-events: none"
        font-size="14"
      >
        {{ node.name }}
      </text>
    </g>
  </svg>
</template>
