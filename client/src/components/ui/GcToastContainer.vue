<script setup lang="ts">
import { useToasts } from "../../composables/useToasts"
const { toasts } = useToasts()
</script>

<template>
  <div class="gc-toast-container">
    <transition-group
      name="gc-toast"
      enter-active-class="gc-toast-enter-active"
      enter-from-class="gc-toast-enter"
      leave-active-class="gc-toast-leave-active"
      leave-to-class="gc-toast-leave"
    >
      <GcToast v-for="t in toasts" :key="t.id" :message="t.message" :type="t.type" />
    </transition-group>
  </div>
</template>
