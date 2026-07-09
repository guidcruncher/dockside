<script setup lang="ts">
import { computed, ref } from "vue"

const props = defineProps<{
  rows: any[]
  columns: {
    key: string
    label: string
    sortable?: boolean
    width?: string
    render?: (row: any) => any
  }[]
  page?: number
  pageSize?: number
  selectable?: boolean
}>()

const emit = defineEmits(["update:page", "rowClick", "selectionChange"])

const sortKey = ref<string | null>(null)
const sortDir = ref<"asc" | "desc">("asc")
const selected = ref<Set<any>>(new Set())

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc"
  } else {
    sortKey.value = key
    sortDir.value = "asc"
  }
}

const sortedRows = computed(() => {
  if (!sortKey.value) return props.rows
  return [...props.rows].sort((a, b) => {
    const av = a[sortKey.value!]
    const bv = b[sortKey.value!]
    if (av < bv) return sortDir.value === "asc" ? -1 : 1
    if (av > bv) return sortDir.value === "asc" ? 1 : -1
    return 0
  })
})

const pagedRows = computed(() => {
  if (!props.page || !props.pageSize) return sortedRows.value
  const start = (props.page - 1) * props.pageSize
  return sortedRows.value.slice(start, start + props.pageSize)
})

function toggleRow(row: any) {
  if (!props.selectable) return
  if (selected.value.has(row)) selected.value.delete(row)
  else selected.value.add(row)
  emit("selectionChange", Array.from(selected.value))
}
</script>

<template>
  <div class="gc-table-wrapper">
    <table class="gc-table">
      <thead>
        <tr>
          <th v-if="selectable" class="gc-th gc-checkbox-cell">
            <input
              type="checkbox"
              :checked="selected.size === rows.length"
              @change="
                () => {
                  if (selected.size === rows.length) selected.clear()
                  else rows.forEach((r) => selected.add(r))
                  emit('selectionChange', Array.from(selected))
                }
              "
            />
          </th>

          <th
            v-for="col in columns"
            :key="col.key"
            class="gc-th"
            :class="{ 'gc-th-sortable': col.sortable }"
            :style="{ width: col.width }"
            @click="col.sortable && toggleSort(col.key)"
          >
            {{ col.label }}
            <span v-if="sortKey === col.key" class="gc-sort-indicator">
              {{ sortDir === "asc" ? "▲" : "▼" }}
            </span>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="row in pagedRows"
          :key="row.id"
          class="gc-tr-hover"
          @click="emit('rowClick', row)"
        >
          <td v-if="selectable" class="gc-td gc-checkbox-cell">
            <input type="checkbox" :checked="selected.has(row)" @change.stop="toggleRow(row)" />
          </td>

          <td v-for="col in columns" :key="col.key" class="gc-td">
            <span v-if="!col.render">{{ row[col.key] }}</span>
            <span v-else>{{ col.render(row) }}</span>
          </td>
        </tr>

        <tr v-if="pagedRows.length === 0">
          <td :colspan="columns.length + (selectable ? 1 : 0)" class="gc-table-empty">No data</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
