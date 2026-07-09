import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import Components from "unplugin-vue-components/vite"
import path from "path"
import lucideRegistryPlugin from "./vite.plugins/lucideRegistry"
import { cssIndexPlugin } from "./vite.plugins/css-index"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [
    vue(),
    lucideRegistryPlugin(),
    cssIndexPlugin({
      componentsDir: "./tailwind-system/components",
      outputFile: "./tailwind-system/components.css",
      tokensImport: "./tokens.css",
      componentImportPath: (fileName) => `./components/${fileName}`,
    }),
    Components({
      dirs: ["src/components", "src/components/ui"],
      extensions: ["vue"],
      directoryAsNamespace: false,
      dts: true,
    }),
  ],
  build: {
    outDir: "./dist",
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5172",
        changeOrigin: true,
        // rewrite logic can be enabled if the backend expects paths without the /api prefix
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
