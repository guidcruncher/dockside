module.exports = {
  presets: [require("./tailwind-system/index.js")],
  content: ["./index.html", "./src/**/*.{vue,js,ts}", "./tailwind-system/**/*.{css,js,ts,vue}"],
}
