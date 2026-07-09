<script setup lang="ts">
import GcIcon from "./GcIcon.vue"
import { computed } from "vue"

const props = defineProps<{
  node: any
  active?: string
  openMap: Record<string, boolean>
}>()

const emit = defineEmits(["select"])

const isOpen = computed(() => !!props.openMap[props.node.id])

function toggle() {
  if (props.node.children?.length) {
    props.openMap[props.node.id] = !isOpen.value
  }
  emit("select", props.node.id)
}
</script>

<template>
  <div>
    <div
      class="gc-tree-item"
      :class="{ 'gc-tree-item-active': node.id === active }"
      @click="toggle"
    >
      <GcIcon
        v-if="node.children?.length"
        name="ChevronRight"
        :class="isOpen ? 'gc-tree-chevron gc-tree-chevron-open' : 'gc-tree-chevron'"
      />

      <GcIcon v-if="node.icon" :name="node.icon" class="gc-tree-icon" />

      <span>{{ node.label }}</span>
    </div>

    <transition name="fade">
      <div v-if="node.children && isOpen" class="gc-tree-children">
        <TreeNodeComponent
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :active="active"
          :openMap="openMap"
          @select="emit('select', $event)"
        />
      </div>
    </transition>
  </div>
</template>
