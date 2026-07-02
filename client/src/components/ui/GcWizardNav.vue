<script setup lang="ts">
import { inject } from "vue"

const next = inject<() => void>("gc-wizard-next")
const back = inject<() => void>("gc-wizard-back")
</script>

<template>
  <div class="gc-wizard-nav">
    <button class="gc-wizard-btn" @click="back">Back</button>
    <button class="gc-wizard-btn" @click="next">Next</button>
  </div>
</template>

<style>
.gc-wizard-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

.gc-wizard-btn {
  padding: 10px 18px;
  border-radius: 8px;
  border: 1px solid rgb(var(--gc-border));
  background: rgb(var(--gc-primary));
  color: rgb(var(--gc-surface));
  font-weight: 500;
  cursor: pointer;
}

.gc-wizard-btn:hover {
  opacity: 0.9;
}
</style>
