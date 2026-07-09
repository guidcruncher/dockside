<script setup lang="ts">
import { useSystemMonitor } from "@/composables/useSystemMonitor"
import { Cpu, MemoryStick } from "@lucide/vue"
import { Dot } from "@lucide/vue"

const { snapshot, loading } = useSystemMonitor()
</script>

<template>
  <GcCard>
    <div class="flex">
      <Dot v-if="loading" class="text-dsnger w-5 h-5" />
      <Dot v-if="!loading" class="text-success w-5 h-5" />
      <h3>Server Status</h3>
    </div>

    <div v-if="snapshot">
      <div class="flex gap-2 items-center">
        <div class="p-2 bg-muted-sof">
          <div class="flex">
            <MemoryStick class="w-5 h-5" />&nbsp;<span class="text-xs"> Used/Available</span>
          </div>
          <div class="flex items-center">
            {{ snapshot.memory.usedPercentage }}% {{ snapshot.memory.availableGb }}gb
          </div>
        </div>
        <div v-for="core in snapshot.cores" :key="core.coreId" class="p-2 bg-muted-sof">
          <div class="flex">
            <Cpu class="w-5 h-5" />&nbsp; <span class="text-xs">Core {{ core.coreId }}</span>
          </div>
          <div class="flex items-center">{{ core.loadPercentage }}%</div>
        </div>
      </div>
    </div>
  </GcCard>
</template>
