<script setup lang="ts">
import { computed } from "vue"
import type { Service } from "@/types"

const props = defineProps<{
  service: Service
}>()

const emit = defineEmits<{
  (e: "update", value: any): void
}>()

function update(patch: Partial<Service>) {
  emit("update", { patchType: "service", patch: patch })
}

// ---------------------------------------------------------
// LOCAL WRAPPER — never use props.service directly
// ---------------------------------------------------------
const service = computed(() => props.service)

/* -------------------------------
   DNS arrays (dns, dns_search)
-------------------------------- */
const dns = computed<string[]>(() => {
  const v = service.value.dns
  return Array.isArray(v) ? v : v ? [v] : []
})

const dnsSearch = computed<string[]>(() => {
  const v = service.value.dns_search
  return Array.isArray(v) ? v : v ? [v] : []
})

function updateDns(index: number, value: string) {
  const copy = [...dns.value]
  copy[index] = value
  update({ dns: copy })
}

function addDns() {
  update({ dns: [...dns.value, ""] })
}

function removeDns(i: number) {
  const copy = [...dns.value]
  copy.splice(i, 1)
  update({ dns: copy })
}

function updateDnsSearch(index: number, value: string) {
  const copy = [...dnsSearch.value]
  copy[index] = value
  update({ dns_search: copy })
}

function addDnsSearch() {
  update({ dns_search: [...dnsSearch.value, ""] })
}

function removeDnsSearch(i: number) {
  const copy = [...dnsSearch.value]
  copy.splice(i, 1)
  update({ dns_search: copy })
}
</script>

<template>
  <div class="space-y-6">
    <h3 class="text-sm font-medium">DNS Settings</h3>

    <!-- HOSTNAME -->
    <GcInput
      placeholder="Hostname"
      :model-value="service.hostname"
      @update:model-value="(v: any) => update({ hostname: v })"
    />

    <!-- DOMAINNAME -->
    <GcInput
      placeholder="Domain Name"
      :model-value="service.domainname"
      @update:model-value="(v: any) => update({ domainname: v })"
    />

    <!-- DNS SERVERS -->
    <div class="space-y-3">
      <h4 class="text-sm font-medium">DNS Servers</h4>

      <div v-for="(entry, i) in dns" :key="'dns-' + i" class="flex gap-2 items-center">
        <GcInput
          class="flex-1"
          placeholder="DNS Server (e.g. 1.1.1.1)"
          :model-value="entry"
          @update:model-value="(v: any) => updateDns(i, v)"
        />
        <GcButton variant="danger" @click="removeDns(i)">Remove</GcButton>
      </div>

      <GcButton variant="primary" @click="addDns"> Add DNS Server </GcButton>
    </div>

    <!-- DNS SEARCH DOMAINS -->
    <div class="space-y-3">
      <h4 class="text-sm font-medium">DNS Search Domains</h4>

      <div v-for="(entry, i) in dnsSearch" :key="'dns-search-' + i" class="flex gap-2 items-center">
        <GcInput
          class="flex-1"
          placeholder="Search Domain (e.g. localdomain)"
          :model-value="entry"
          @update:model-value="(v: any) => updateDnsSearch(i, v)"
        />
        <GcButton variant="danger" @click="removeDnsSearch(i)">Remove</GcButton>
      </div>

      <GcButton variant="primary" @click="addDnsSearch"> Add Search Domain </GcButton>
    </div>
  </div>
</template>
