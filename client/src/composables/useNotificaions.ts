import { ref } from "vue"

export type Notification = {
  id: string
  title: string
  message: string
  time?: string
  unread?: boolean
}

const notifications = ref<Notification[]>([])
const flyoutOpen = ref(false)
const centerOpen = ref(false)

function pushNotification(n: Notification) {
  notifications.value.unshift({
    unread: true,
    time: new Date().toLocaleTimeString(),
    ...n,
  })
}

function markAllRead() {
  notifications.value.forEach((n) => (n.unread = false))
}

function toggleFlyout() {
  flyoutOpen.value = !flyoutOpen.value
}

function toggleCenter() {
  centerOpen.value = !centerOpen.value
}

export function useNotifications() {
  return {
    notifications,
    flyoutOpen,
    centerOpen,
    pushNotification,
    markAllRead,
    toggleFlyout,
    toggleCenter,
  }
}
