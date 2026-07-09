import { reactive } from "vue"

export type Toast = {
  id: number
  message: string
  type: string
}

const toasts = reactive<Toast[]>([])
let id = 0

function show(message: string, type: string = "info", timeout = 3000) {
  const t = { id: id++, message, type }
  toasts.push(t)

  setTimeout(() => {
    const index = toasts.findIndex((x) => x.id === t.id)
    if (index !== -1) toasts.splice(index, 1)
  }, timeout)
}

function success(msg: string, timeout?: number) {
  show(msg, "success", timeout)
}

function error(msg: string, timeout?: number) {
  show(msg, "error", timeout)
}

function warning(msg: string, timeout?: number) {
  show(msg, "warning", timeout)
}

function info(msg: string, timeout?: number) {
  show(msg, "info", timeout)
}

export function useToasts() {
  return {
    toasts,
    show,
    success,
    error,
    warning,
    info,
  }
}
