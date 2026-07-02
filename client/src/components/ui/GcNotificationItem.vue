<script setup lang="ts">
import type { Notification } from "../../composables/useNotificaions"
import { useNotifications } from "../../composables/useNotificaions"

const { markAllRead } = useNotifications()

const props = defineProps<{
  notification: Notification
  clickable?: boolean
}>()

function onClick() {
  if (props.clickable) {
    props.notification.unread = false
    markAllRead()
  }
}
</script>

<template>
  <div class="gc-notify-item" :class="{ 'gc-notify-unread': notification.unread }" @click="onClick">
    <div class="gc-notify-title">{{ notification.title }}</div>
    <div class="gc-notify-message">{{ notification.message }}</div>
    <div class="gc-notify-time">{{ notification.time }}</div>
  </div>
</template>
