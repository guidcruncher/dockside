import type { Config } from "#/config/types.js"
import { loadConfig } from "#/config/loader.js"
import { createServer } from "./app.js"

const config: Config = loadConfig()
const server = createServer({
  logger: {
    level: config.server.logLevel,
  },
})

const start = async (): Promise<void> => {
  try {
    await server.listen({ port: config.server.port, host: config.server.host })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
