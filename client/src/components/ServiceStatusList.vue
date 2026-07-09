<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue"
import { useContainers } from "@/composables/useContainers"
import type { WorkspaceProjectState } from "@/api"
import { Dot } from "@lucide/vue"

interface ProjectWrapper {
  key: string
  value: WorkspaceProjectState
}

interface Props {
  project?: ProjectWrapper
}

const props = defineProps<Props>()
const containers = useContainers()

const refreshing = ref<boolean>(false)
const stats = ref<any[]>([])
const cputrend = ref<Record<string, number[]>>({})
const memtrend = ref<Record<string, number[]>>({})
const trendlimit = 20

watch(
  () => props.project,
  async (_v) => {
    if (!props.project || refreshing.value) return

    refreshing.value = true
    const services = props.project.value.services.map((t: any) => t.name)
    const currentStats = await containers.statsList(services)
    stats.value = props.project.value.services.map((t: any) => {
      const stat = currentStats[t.name]

      if (!cputrend.value[t.name]) cputrend.value[t.name] = []
      if (!memtrend.value[t.name]) memtrend.value[t.name] = []

      if (memtrend.value[t.name].length >= trendlimit) memtrend.value[t.name].shift()
      if (cputrend.value[t.name].length >= trendlimit) cputrend.value[t.name].shift()

      const rawCpu = stat?.cpu?.percentNormalized
      const rawMem = stat?.memory?.percent
      const cpu = Number.isFinite(rawCpu) ? rawCpu : 0
      const mem = Number.isFinite(rawMem) ? rawMem : 0
      cputrend.value[t.name].push(cpu)
      memtrend.value[t.name].push(mem)

      const res = {
        name: t.name,
        id: stat?.id,
        image: t.image,
        state: t.state,
        health: t.health,
        cpu: cpu,
        mem: mem,
        stats: stat,
      }
      return res
    })
    refreshing.value = false
  },
  { deep: true, immediate: true },
)

onMounted(async () => {})

onUnmounted(async () => {})
</script>

<template>
  <GcCard>
    <div class="space-y-6">
      <div class="flex">
        <Dot v-if="refreshing" class="text-dsnger w-5 h-5" />
        <Dot v-if="!refreshing" class="text-success w-5 h-5" />
        <h3>Service Status</h3>
      </div>

      <div
        v-for="item in stats"
        :key="item.name"
        class="bg-surface border border-border p-4 rounded-xl shadow-soft flex items-center gap-6"
      >
        <div class="flex gap-4">
          <div class="text-center">
            <GcGauge :value="item.cpu" :thresholds="{ warning: 60, danger: 85 }" size="md" />
            <span class="text-xs text-muted-foreground block mt-1">CPU</span>
          </div>
          <div class="text-center">
            <GcGauge :value="item.mem" :thresholds="{ warning: 60, danger: 85 }" size="md" />
            <span class="text-xs text-muted-foreground block mt-1">RAM</span>
          </div>
          <div>
            <div>
              <div class="text-xs">CPU History</div>
              <GcTrendLine
                v-if="cputrend[item.name]?.length"
                :data="cputrend[item.name]"
                :width="100"
                :height="60"
              />
            </div>
            <div>
              <div class="text-xs">&nbsp;</div>
              <div class="text-xs">Memory History</div>
              <GcTrendLine
                v-if="memtrend[item.name]?.length"
                :data="memtrend[item.name]"
                :width="100"
                :height="60"
              />
            </div>
          </div>
        </div>

        <div class="flex-1 grid grid-cols-2 gap-2 text-sm">
          <div class="col-span-2 font-bold text-text truncate">{{ item.name }}</div>
          <div class="text-muted">Image:</div>
          <div class="text-text truncate">{{ item.image }}</div>

          <div class="text-muted">Status:</div>
          <div
            class="font-medium capitalize"
            :class="item.state === 'running' ? 'text-success' : 'text-danger'"
          >
            {{ item.state }}
          </div>

          <div class="text-muted">Health:</div>
          <div class="text-text">{{ item.health }}</div>
        </div>
      </div>
    </div>
  </GcCard>
</template>
