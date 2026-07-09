<script setup lang="ts">
import { ref } from "vue"
import TreeNodeComponent from "./TreeNodeComponent.vue"

export interface TreeNode {
  id: string
  label: string
  icon?: string
  children?: TreeNode[]
}

const props = defineProps<{
  nodes: TreeNode[]
  active?: string
}>()

const emit = defineEmits<{
  (e: "select", id: string): void
}>()

const openMap = ref<Record<string, boolean>>({})
</script>

<template>
  <div class="gc-tree">
    <TreeNodeComponent
      v-for="node in nodes"
      :key="node.id"
      :node="node"
      :active="active"
      :openMap="openMap"
      @select="emit('select', $event)"
    />
  </div>
</template>
