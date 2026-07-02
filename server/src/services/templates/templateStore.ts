import { readFile, writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import type { TemplateIndexEntry, TemplateIndex, Template } from "./types.js"
import { normalizeTemplate } from "./normalizeTemplate.js"

export interface IndexDelta {
  added: TemplateIndex
  updated: TemplateIndex
}

const TENPLATE_BASE_URL =
  "https://raw.githubusercontent.com/guidcruncher/dockside/refs/heads/main/templates"

// --- Store Implementation ---
export class TemplateStore {
  private localPath: string
  private templatesDir: string

  constructor(localPath: string) {
    this.localPath = `${localPath}/index.json`
    this.templatesDir = path.join(path.dirname(this.localPath), "templates")
  }

  async getDelta(remoteIndex: TemplateIndex): Promise<IndexDelta> {
    const localIndex: TemplateIndex = await this.loadLocalIndex()
    const delta: IndexDelta = { added: {}, updated: {} }

    for (const [key, remoteEntry] of Object.entries(remoteIndex)) {
      const localEntry = localIndex[key]
      if (!localEntry) {
        delta.added[key] = remoteEntry
      } else if (remoteEntry.version > localEntry.version) {
        delta.updated[key] = remoteEntry
      }
    }

    return delta
  }

  async loadLocalIndex(): Promise<TemplateIndex> {
    if (!existsSync(this.localPath)) return {}
    try {
      const data = await readFile(this.localPath, "utf-8")
      return JSON.parse(data) as TemplateIndex
    } catch {
      return {}
    }
  }

  async loadRemoteIndex(): Promise<TemplateIndex> {
    try  {
      const response = await fetch(`${TENPLATE_BASE_URL}/index.json`)
      if (!response.ok) {
        throw new Error(`Failed to download renote index`)
      }

      const data: any = await response.json()

      return data as TemplateIndex
    } catch (er) {
      return {}
    }
  }

  async saveLocalIndex(index: TemplateIndex): Promise<void> {
    await mkdir(path.dirname(this.localPath), { recursive: true })
    await writeFile(this.localPath, JSON.stringify(index, null, 2))
  }

  async downloadTemplate(templateName: string): Promise<Template> {
    const response = await fetch(`${TENPLATE_BASE_URL}/${templateName}.json`)
    if (!response.ok) {
      throw new Error(`Failed to download ${templateName}: ${response.statusText}`)
    }

    const template: any = await response.json()

    template.raw = normalizeTemplate(template)
    const savePath = path.join(this.templatesDir, `${templateName}.json`)
    await mkdir(this.templatesDir, { recursive: true })
    await writeFile(savePath, JSON.stringify(template, null, 2))

    return template
  }

  // ---------------------------------------------------------
  // NEW: Return the local index (same as loadLocalIndex)
  // ---------------------------------------------------------
  async getLocalIndex(): Promise<TemplateIndex> {
    return await this.loadLocalIndex()
  }

  // ---------------------------------------------------------
  // NEW: Load a single local template by name
  // ---------------------------------------------------------
  async getLocalTemplate(name: string): Promise<Template | null> {
    const filePath = path.join(this.templatesDir, `${name}.json`)

    if (!existsSync(filePath)) return null

    try {
      const raw = await readFile(filePath, "utf-8")
      const tpl = JSON.parse(raw)

      // Ensure normalization is always applied
      tpl.raw = normalizeTemplate(tpl)

      return tpl as Template
    } catch (err) {
      console.error(`Failed to load local template ${name}:`, err)
      return null
    }
  }
}

export const runTemplateSync = async (store: TemplateStore) => {
  try {
    console.log("Checking for template updates...")

    // 1. Fetch remote index
    const remoteIndex = await store.loadRemoteIndex()

    // 2. Determine what needs to be added or updated
    const delta = await store.getDelta(remoteIndex)
    const toSync = { ...delta.added, ...delta.updated }
    const syncKeys = Object.keys(toSync)
    if (syncKeys.length === 0) {
      console.log("Everything is up to date.")
      return
    }

    console.log(`Found ${syncKeys.length} updates. Starting downloads...`)

    // 3. Process downloads concurrently
    const results = await Promise.allSettled(syncKeys.map((name) => store.downloadTemplate(name)))

    // 4. Handle results and update index
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        console.log(`Successfully synced: ${syncKeys[index]}`)
      } else {
        console.error(`Failed to sync ${syncKeys[index]}: ${result.reason}`)
      }
    })

    await store.saveLocalIndex(remoteIndex)
    console.log("Synchronization complete.")
  } catch (error) {
    console.error("Critical error during sync:", error)
  }
}
