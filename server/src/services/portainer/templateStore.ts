import fs from "node:fs/promises"
import type { Config } from "#/config/types.js"
import path from "node:path"
import type { PortainerAppTemplate, PortainerTemplateEntry } from "./types.js"
import logger from "#/logger.js"

export interface TemplateStoreOptions {
  cacheDir: string // directory to store cache file
  cacheFile?: string // filename inside cacheDir
  filterType?: 1 | 2 | null // null = keep all except type 3
}

export class PortainerTemplateStore {
  private templates: PortainerTemplateEntry[] = []
  private version = ""
  private loaded = false
  private url: string
  private opts: TemplateStoreOptions = { cacheDir: "" }

  constructor(config: Config) {
    this.url = config.templates.portainer.url
    this.opts.cacheDir = path.dirname(config.templates.portainer.cache)
    this.opts.cacheFile = path.basename(config.templates.portainer.cache)
  }

  // ---------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------
  getEntries(): PortainerTemplateEntry[] {
    return this.templates.sort((a: any, b: any) => {
      return a.title.localeCompare(b.title)
    })
  }

  /**
   * Get a sorted, unique list of all categories across templates.
   */
  getCategories(): string[] {
    const set = new Set<string>()

    for (const t of this.templates) {
      if (Array.isArray(t.categories)) {
        for (const c of t.categories) {
          if (c && c.trim()) {
            set.add(c.trim())
          }
        }
      }
    }

    return Array.from(set).sort((a: string, b: string) => a.localeCompare(b))
  }

  /**
   * Filter templates by keyword (title, description, categories)
   * and optional category array.
   *
   * Returns a sorted list of matches (sorted by title).
   *
   * @param keyword - text to search for (case-insensitive)
   * @param categories - optional array of categories to match (OR logic)
   */
  filter(keyword: string, categories?: string[]): PortainerTemplateEntry[] {
    const q = keyword.trim().toLowerCase()
    const cats = categories?.map((c: any) => c.toLowerCase()) ?? null

    const matches = this.templates.filter((t: any) => {
      const title = t.title.toLowerCase()
      const desc = t.description.toLowerCase()
      const tCats = t.categories.map((c: any) => c.toLowerCase())

      // Keyword match (title OR description OR category)
      const keywordMatch =
        !q || title.includes(q) || desc.includes(q) || tCats.some((c: any) => c.includes(q))

      // Category array match (OR logic)
      const categoryMatch = !cats || cats.some((c: any) => tCats.includes(c))

      return keywordMatch && categoryMatch
    })

    return matches.sort((a, b) => a.title.localeCompare(b.title))
  }

  async load(): Promise<void> {
    if (this.loaded) return

    // Try loading from file system cache
    const cached = await this.loadFromCache()
    if (cached) {
      this.templates = cached.templates
      this.version = cached.version
      this.loaded = true
      return
    }

    // Fetch remote template file
    const remote = await this.fetchRemote()

    // Strip type 3 + normalize
    const normalized = this.normalize(remote)

    this.templates = normalized.templates
    this.version = normalized.version
    this.loaded = true

    // Save to file system cache
    await this.saveToCache(normalized)
  }

  getAll(): PortainerTemplateEntry[] {
    return this.templates
  }

  getByTitle(title: string): PortainerTemplateEntry | undefined {
    return this.templates.find((t: any) => t.title.toLowerCase() === title.toLowerCase())
  }

  getById(id: number): PortainerTemplateEntry | undefined {
    return this.templates.find((t: any) => t.id === id)
  }

  getVersion(): string {
    return this.version
  }

  async clearCache(): Promise<void> {
    const file = path.join(this.opts.cacheDir, this.opts.cacheFile!)
    try {
      await fs.unlink(file)
    } catch {
      // ignore
    }
    this.templates = []
    this.version = ""
    this.loaded = false
  }

  // ---------------------------------------------------------
  // INTERNALS
  // ---------------------------------------------------------

  private async fetchRemote(): Promise<PortainerAppTemplate> {
    const res = await fetch(this.url)
    if (!res.ok) {
      throw new Error(`Failed to load template file: ${res.status}`)
    }

    const data = (await res.json()) as PortainerAppTemplate
    return data
  }

  private normalize(remote: PortainerAppTemplate): PortainerAppTemplate {
    const filtered = remote.templates
      .filter((t: any) => t.type !== 3)
      .filter((t: any) => {
        if (!this.opts.filterType) return true
        return t.type === this.opts.filterType
      })

    return {
      version: remote.version,
      templates: filtered,
    }
  }

  // ---------------------------------------------------------
  // FILE SYSTEM CACHE
  // ---------------------------------------------------------

  private async loadFromCache(): Promise<PortainerAppTemplate | null> {
    const file = path.join(this.opts.cacheDir, this.opts.cacheFile!)

    try {
      const raw = await fs.readFile(file, "utf8")
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  private async saveToCache(data: PortainerAppTemplate): Promise<void> {
    const file = path.join(this.opts.cacheDir, this.opts.cacheFile!)

    try {
      await fs.mkdir(this.opts.cacheDir, { recursive: true })
      await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8")
    } catch (err) {
      logger.error(err, "Failed to write template cache:")
    }
  }
}
