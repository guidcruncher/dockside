<script setup lang="ts">
import { computed } from "vue"
import type { Service } from "@/types"

import { Trash2 } from "@lucide/vue"

const props = defineProps<{
  service: Service
}>()

const emit = defineEmits<{
  (e: "update", value: any): void
}>()

// ---------------------------------------------------------
// LOCAL WRAPPER — never use props.service directly
// ---------------------------------------------------------
const service = computed(() => props.service)

function update(patch: Partial<Service>) {
  emit("update", { patchType: "service", patch: patch })
}

/* ---------------------------------------
   Generic array helpers
---------------------------------------- */
function updateArray(field: keyof Service, index: number, value: string) {
  const arr = [...((service.value[field] as string[]) ?? [])]
  arr[index] = value
  update({ [field]: arr })
}

function addArray(field: keyof Service) {
  const arr = [...((service.value[field] as string[]) ?? [])]
  arr.push("")
  update({ [field]: arr })
}

function removeArray(field: keyof Service, index: number) {
  const arr = [...((service.value[field] as string[]) ?? [])]
  arr.splice(index, 1)
  update({ [field]: arr })
}

/* ---------------------------------------
   Ulimits helpers
---------------------------------------- */
function updateUlimit(name: string, soft: number, hard: number) {
  const copy = { ...(service.value.ulimits ?? {}) }
  copy[name] = { soft, hard }
  update({ ulimits: copy })
}

function removeUlimit(name: string) {
  const copy = { ...(service.value.ulimits ?? {}) }
  delete copy[name]
  update({ ulimits: copy })
}

function addUlimit() {
  const copy = { ...(service.value.ulimits ?? {}) }
  copy["NEW_LIMIT"] = { soft: 0, hard: 0 }
  update({ ulimits: copy })
}
</script>

<template>
  <div class="space-y-10">
    <!-- ENV FILE -->
    <div>
      <h3 class="text-sm font-medium">Env File</h3>

      <div
        v-for="(entry, i) in service.env_file ?? []"
        :key="'env-file-' + i"
        class="flex gap-2 items-center mt-2"
      >
        <GcInput
          placeholder="Path to env file"
          :model-value="entry"
          @update:model-value="(v: any) => updateArray('env_file', Number(i), v)"
        />
        <GcButton variant="danger" @click="removeArray('env_file', Number(i))"
          ><Trash2 class="w-5 h-5"
        /></GcButton>
      </div>

      <GcButton class="mt-2" variant="primary" @click="addArray('env_file')">
        Add Env File
      </GcButton>
    </div>

    <!-- EXTRA HOSTS -->
    <div>
      <h3 class="text-sm font-medium">Extra Hosts</h3>

      <div
        v-for="(entry, i) in service.extra_hosts ?? []"
        :key="'extra-host-' + i"
        class="flex gap-2 items-center mt-2"
      >
        <GcInput
          placeholder="hostname:ip"
          :model-value="entry"
          @update:model-value="(v: any) => updateArray('extra_hosts', Number(i), v)"
        />
        <GcButton variant="danger" @click="removeArray('extra_hosts', Number(i))">
          Remove
        </GcButton>
      </div>

      <GcButton class="mt-2" variant="primary" @click="addArray('extra_hosts')">
        Add Extra Host
      </GcButton>
    </div>

    <!-- EXPOSE -->
    <div>
      <h3 class="text-sm font-medium">Expose</h3>

      <div
        v-for="(entry, i) in service.expose ?? []"
        :key="'expose-' + i"
        class="flex gap-2 items-center mt-2"
      >
        <GcInput
          placeholder="Port (e.g. 8080)"
          :model-value="entry"
          @update:model-value="(v: any) => updateArray('expose', Number(i), v)"
        />
        <GcButton variant="danger" @click="removeArray('expose', Number(i))"
          ><Trash2 class="w-5 h-5"
        /></GcButton>
      </div>

      <GcButton class="mt-2" variant="primary" @click="addArray('expose')">
        Add Exposed Port
      </GcButton>
    </div>

    <!-- LINKS -->
    <div>
      <h3 class="text-sm font-medium">Links</h3>

      <div
        v-for="(entry, i) in service.links ?? []"
        :key="'link-' + i"
        class="flex gap-2 items-center mt-2"
      >
        <GcInput
          placeholder="service:alias"
          :model-value="entry"
          @update:model-value="(v: any) => updateArray('links', Number(i), v)"
        />
        <GcButton variant="danger" @click="removeArray('links', Number(i))"
          ><Trash2 class="w-5 h-5"
        /></GcButton>
      </div>

      <GcButton class="mt-2" variant="primary" @click="addArray('links')"> Add Link </GcButton>
    </div>

    <!-- DEVICES -->
    <div>
      <h3 class="text-sm font-medium">Devices</h3>

      <div
        v-for="(entry, i) in service.devices ?? []"
        :key="'device-' + i"
        class="flex gap-2 items-center mt-2"
      >
        <GcInput
          placeholder="/dev/ttyUSB0:/dev/ttyUSB0"
          :model-value="entry"
          @update:model-value="(v: any) => updateArray('devices', Number(i), v)"
        />
        <GcButton variant="danger" @click="removeArray('devices', Number(i))">
          <Trash2 class="h-5 w-5" />
        </GcButton>
      </div>

      <GcButton class="mt-2" variant="primary" @click="addArray('devices')"> Add Device </GcButton>
    </div>

    <!-- TMPFS -->
    <div>
      <h3 class="text-sm font-medium">Tmpfs</h3>

      <div
        v-for="(entry, i) in service.tmpfs ?? []"
        :key="'tmpfs-' + i"
        class="flex gap-2 items-center mt-2"
      >
        <GcInput
          placeholder="/run:rw,noexec"
          :model-value="entry"
          @update:model-value="(v: any) => updateArray('tmpfs', Number(i), v)"
        />
        <GcButton variant="danger" @click="removeArray('tmpfs', Number(i))">
          <Trash2 class="h-5 w-5" />
        </GcButton>
      </div>

      <GcButton class="mt-2" variant="primary" @click="addArray('tmpfs')"> Add Tmpfs </GcButton>
    </div>

    <!-- SYSCTLS -->
    <div>
      <h3 class="text-sm font-medium">Sysctls</h3>

      <div
        v-for="(entry, i) in service.sysctls ?? []"
        :key="'sysctl-' + i"
        class="flex gap-2 items-center mt-2"
      >
        <GcInput
          placeholder="net.ipv4.ip_forward=1"
          :model-value="entry"
          @update:model-value="(v: any) => updateArray('sysctls', Number(i), v)"
        />
        <GcButton variant="danger" @click="removeArray('sysctls', Number(i))">
          <Trash2 class="h-5 w-5" />
        </GcButton>
      </div>

      <GcButton class="mt-2" variant="primary" @click="addArray('sysctls')"> Add Sysctl </GcButton>
    </div>

    <!-- ULIMITS -->
    <div>
      <h3 class="text-sm font-medium">Ulimits</h3>

      <div
        v-for="(val, name) in service.ulimits ?? {}"
        :key="name"
        class="flex gap-2 items-center mt-2"
      >
        <GcInput class="w-32" placeholder="name" :model-value="name" disabled />

        <GcInput
          class="w-32"
          placeholder="soft"
          type="number"
          :model-value="val.soft ?? 0"
          @update:model-value="(v: any) => updateUlimit(name, Number(v), Number(val.hard ?? 0))"
        />

        <GcInput
          class="w-32"
          placeholder="hard"
          type="number"
          :model-value="val.hard ?? 0"
          @update:model-value="(v: any) => updateUlimit(name, Number(val.soft ?? 0), Number(v))"
        />

        <GcButton variant="danger" @click="removeUlimit(name)">
          <Trash2 class="h-5 w-5" />
        </GcButton>
      </div>

      <GcButton class="mt-2" variant="primary" @click="addUlimit"> Add Ulimit </GcButton>
    </div>

    <!-- USER -->
    <div>
      <h3 class="text-sm font-medium">User</h3>
      <GcInput
        placeholder="user or uid"
        :model-value="service.user"
        @update:model-value="(v: any) => update({ user: v })"
      />
    </div>

    <!-- WORKING DIR -->
    <div>
      <h3 class="text-sm font-medium">Working Directory</h3>
      <GcInput
        placeholder="/app"
        :model-value="service.working_dir"
        @update:model-value="(v: any) => update({ working_dir: v })"
      />
    </div>

    <!-- ENTRYPOINT -->
    <div>
      <h3 class="text-sm font-medium">Entrypoint</h3>
      <GcInput
        placeholder="entrypoint command"
        :model-value="service.entrypoint"
        @update:model-value="(v: any) => update({ entrypoint: v })"
      />
    </div>
  </div>
</template>
