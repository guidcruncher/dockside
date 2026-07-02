import { ref } from "vue"

export type Command = {
  id: string
  label: string
  action: () => void
  group?: string
}

const commands = ref<Command[]>([])

function registerCommand(cmd: Command) {
  if (!commands.value.find((c) => c.id === cmd.id)) {
    commands.value.push(cmd)
  }
}

function unregisterCommand(id: string) {
  commands.value = commands.value.filter((c) => c.id !== id)
}

export function useCommands() {
  return {
    commands,
    registerCommand,
    unregisterCommand,
  }
}
