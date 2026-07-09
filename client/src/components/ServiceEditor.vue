<script setup lang="ts">
import { computed } from "vue"
import type { Service } from "@/types"

import ServiceBasicsSection from "@/components/sections/ServiceBasicSection.vue"
import ServiceRuntimeSection from "@/components/sections/ServiceRuntimeSection.vue"
import ServiceNetworkingSection from "@/components/sections/ServiceNetworkingSection.vue"
import ServiceDnsSection from "@/components/sections/ServiceDnsSection.vue"
import ServiceSecretsConfigsSection from "@/components/sections/ServiceSecretsConfigsSection.vue"
import ServiceAdvancedFieldsSection from "@/components/sections/ServiceAdvancedSection.vue"
import ServiceHealthcheckSection from "@/components/sections/ServiceHealthcheckSection.vue"
import ServiceDeploySection from "@/components/sections/ServiceDeploySection.vue"
import ServiceLoggingSection from "@/components/sections/ServiceLoggingSection.vue"
import ServiceDependsOnSection from "@/components/sections/ServiceDependsOnSection.vue"
import ServiceBuildSection from "@/components/sections/ServiceBuildSection.vue"
import ServiceProfilesSection from "@/components/sections/ServiceProfilesSection.vue"

const props = defineProps<{
  modelValue: Service
  availableSecrets: string[]
  availableConfigs: string[]
  availableServices: string[]
  availableNetworks: string[]
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: Service): void
}>()

// ---------------------------------------------------------
// LOCAL REACTIVE WRAPPER
// ---------------------------------------------------------
const service = computed<Service>({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
})

// ---------------------------------------------------------
// SAFE PATCH MERGE
// ---------------------------------------------------------
function update(patch: Partial<Service>) {
  service.value = {
    ...service.value,
    ...patch,
  }
}
</script>

<template>
  <div class="space-y-10">
    <!-- BASICS -->
    <ServiceBasicsSection :service="service" @update="update" />
    <GcDivider />

    <!-- BUILD -->
    <ServiceBuildSection :service="service" @update="update" />
    <GcDivider />

    <!-- RUNTIME -->
    <ServiceRuntimeSection :service="service" @update="update" />
    <GcDivider />

    <!-- NETWORKING -->
    <ServiceNetworkingSection
      :service="service"
      :available-networks="availableNetworks"
      @update="update"
    />
    <GcDivider />

    <!-- DNS -->
    <ServiceDnsSection :service="service" @update="update" />
    <GcDivider />

    <!-- SECRETS & CONFIGS -->
    <ServiceSecretsConfigsSection
      :service="service"
      :available-secrets="availableSecrets"
      :available-configs="availableConfigs"
      @update="update"
    />
    <GcDivider />

    <!-- HEALTHCHECK -->
    <ServiceHealthcheckSection :service="service" @update="update" />
    <GcDivider />

    <!-- DEPLOY -->
    <ServiceDeploySection :service="service" @update="update" />
    <GcDivider />

    <!-- LOGGING -->
    <ServiceLoggingSection :service="service" @update="update" />
    <GcDivider />

    <!-- DEPENDS_ON -->
    <ServiceDependsOnSection
      :service="service"
      :available-services="availableServices"
      @update="update"
    />
    <GcDivider />

    <!-- PROFILES -->
    <ServiceProfilesSection :service="service" @update="update" />
    <GcDivider />

    <!-- ADVANCED -->
    <ServiceAdvancedFieldsSection :service="service" @update="update" />
  </div>
</template>
