import pino from "pino"
import { loadConfig } from "#/config/loader.js"

const config = loadConfig()

const logger = pino({
  level: config.server.logLevel ?? "info",
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
})

export default logger
