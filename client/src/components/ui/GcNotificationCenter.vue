<script setup lang="ts">
import { useNotifications } from "../../composables/useNotificaions"
import GcNotificationItem from "./GcNotificationItem.vue"

const { notifications, centerOpen, markAllRead, toggleCenter } = useNotifications()
</script>

<template>
  <div v-if="centerOpen" class="gc-center-overlay" @click.self="toggleCenter">
    <div class="gc-center-panel">
      <div class="gc-center-header">
        <h2 class="text-lg font-semibold">Notification Center</h2>
        <button class="gc-notify-clear" @click="markAllRead">Mark all read</button>
      </div>

      <div class="gc-center-list">
        <GcNotificationItem v-for="n in notifications" :key="n.id" :notification="n" />

        <div v-if="notifications.length === 0" class="gc-center-empty">No notifications</div>
      </div>
    </div>
  </div>
</template>
