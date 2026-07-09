import type { Plugin } from "vite"
import fs from "fs"
import path from "path"
import glob from "fast-glob"
import * as lucide from "@lucide/vue"
import { parse as parseSFC } from "@vue/compiler-sfc"
import { compile } from "@vue/compiler-dom"
import type { ElementNode, Node } from "@vue/compiler-dom"

function isImage(name: string) {
  return (
    name.startsWith("http") ||
    name.startsWith("/") ||
    name.startsWith("./") ||
    name.startsWith("data:")
  )
}

function toPascalCase(name: string) {
  return name
    .split(/[-_]/g)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("")
}

function getSimpleContent(exp: any): string | null {
  if (!exp) return null
  if (exp.type === 4 /* SIMPLE_EXPRESSION */) return exp.content
  return null
}

function isGcIcon(tag: string) {
  return tag.replace(/-/g, "").toLowerCase() === "gcicon"
}

function isGcSidebarItem(tag: string) {
  return tag.replace(/-/g, "").toLowerCase() === "gcsidebaritem"
}

function walk(node: Node, used: Set<string>) {
  // Root node
  if ((node as any).type === 0 && (node as any).children) {
    for (const child of (node as any).children) {
      walk(child as Node, used)
    }
    return
  }

  // Element node
  if ((node as any).type === 1) {
    const el = node as ElementNode

    if (isGcIcon(el.tag) || isGcSidebarItem(el.tag)) {
      for (const prop of el.props) {
        // name="bell"
        if (prop.type === 6 && (prop.name === "name" || prop.name === "icon") && prop.value) {
          if (!isImage(prop.value.content)) {
            used.add(toPascalCase(prop.value.content))
          }
        }

        // :name="'bell'"
        if (prop.type === 7 && prop.name === "bind") {
          const arg = getSimpleContent(prop.arg)
          if (arg === "name") {
            const exp = getSimpleContent(prop.exp)
            const m = exp?.match(/^['"`](.*)['"`]$/)
            if (m) {
              if (!isImage(m[1])) {
                used.add(toPascalCase(m[1]))
              }
            }
          }
        }
      }
    }

    if (el.children) {
      for (const child of el.children) {
        walk(child as Node, used)
      }
    }
  }
}

export default function lucideRegistry(): Plugin {
  return {
    name: "lucide-registry",
    // apply: "serve",

    async buildStart() {
      const files = await glob("src/**/*.vue", { absolute: true })
      const used = new Set<string>()

      for (const file of files) {
        const content = fs.readFileSync(file, "utf8")
        const { descriptor } = parseSFC(content, { filename: file })

        const template = descriptor.template?.content
        if (!template) continue

        const { ast } = compile(template, { hoistStatic: false })
        walk(ast as unknown as Node, used)
      }

      const valid = [...used].filter((n) => n in lucide).sort()

      console.log(`Lucide registry: ${valid.length} icons found`)

      const outFile = path.resolve("src/icons/lucide.ts")
      const lines = [
        "// AUTO‑GENERATED — DO NOT EDIT",
        "import * as lucide from '@lucide/vue'",
        "",
        "export const lucideIcons = {",
        ...valid.map((n) => `  "${n}": lucide.${n},`),
        "} as const",
        "",
      ]

      fs.mkdirSync(path.dirname(outFile), { recursive: true })
      fs.writeFileSync(outFile, lines.join("\n"))
    },
  }
}
