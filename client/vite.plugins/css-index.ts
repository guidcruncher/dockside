import fs from "node:fs"
import path from "node:path"
import type { Plugin } from "vite"

interface CssIndexPluginOptions {
  /**
   * Directory containing component CSS files, relative to project root.
   * e.g. "src/styles/components"
   */
  componentsDir: string

  /**
   * Path of the generated CSS file, relative to project root.
   * e.g. "src/styles/index.css"
   */
  outputFile: string

  /**
   * Path to tokens.css relative to the output file.
   * e.g. "./tokens.css"
   */
  tokensImport?: string

  /**
   * How to build the import path for each component file,
   * given the filename (e.g. "buttons.css").
   * Default: (file) => `./components/${file}`
   */
  componentImportPath?: (fileName: string) => string
}

export function cssIndexPlugin(options: CssIndexPluginOptions): Plugin {
  const {
    componentsDir,
    outputFile,
    tokensImport = "./tokens.css",
    componentImportPath = (fileName: string) => `./components/${fileName}`,
  } = options

  return {
    name: "css-index-plugin",
    apply: "build",

    buildStart() {
      const root = process.cwd()
      const componentsAbs = path.resolve(root, componentsDir)
      const outputAbs = path.resolve(root, outputFile)

      if (!fs.existsSync(componentsAbs)) {
        this.warn(`[css-index-plugin] componentsDir does not exist: ${componentsAbs}`)
        return
      }

      const files = fs
        .readdirSync(componentsAbs, { withFileTypes: true })
        .filter((d) => d.isFile() && d.name.endsWith(".css"))
        .map((d) => d.name)
        .sort() // stable, alphabetical

      const lines: string[] = []

      // tokens import first
      if (tokensImport) {
        lines.push(`@import "${tokensImport}";`, "", "/* Components */")
      }

      for (const file of files) {
        const importPath = componentImportPath(file)
        lines.push(`@import "${importPath}";`)
      }

      const content = lines.join("\n") + "\n"

      // ensure directory exists
      fs.mkdirSync(path.dirname(outputAbs), { recursive: true })
      fs.writeFileSync(outputAbs, content, "utf8")

      this.info(
        `[css-index-plugin] generated ${path.relative(root, outputAbs)} with ${
          files.length
        } component imports`,
      )
    },
  }
}
