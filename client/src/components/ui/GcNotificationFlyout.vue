<script setup lang="ts">
import { useNotifications } from "../../composables/useNotificaions"
import GcNotificationItem from "./GcNotificationItem.vue"

const { markAllRead, toggleCenter, notifications, flyoutOpen } = useNotifications()
</script>

<template>
  <div class="relative">
    <div v-if="flyoutOpen" class="gc-notify-flyout">
      <div class="gc-notify-header">
        <span>Notifications</span>

        <div class="flex gap-2">
          <button class="gc-notify-clear" @click="markAllRead">Mark all read</button>
          <button class="gc-notify-clear" @click="toggleCenter">Open Center</button>
        </div>
      </div>

      <div class="gc-notify-list">
        <GcNotificationItem v-for="n in notifications" :key="n.id" :notification="n" />

        <div v-if="notifications.length === 0" class="gc-notify-empty">No notifications</div>
      </div>
    </div>
  </div>
</template>
