module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--gc-bg) / <alpha-value>)",
        surface: "rgb(var(--gc-surface) / <alpha-value>)",
        "navbar-bg": "rgb(var(--gc-navbar-bg) / <alpha-value>)",
        "navbar-text": "rgb(var(--gc-navbar-text) / <alpha-value>)",
        border: "rgb(var(--gc-border) / <alpha-value>)",
        text: "rgb(var(--gc-text) / <alpha-value>)",
        primary: "rgb(var(--gc-primary) / <alpha-value>)",

        /* semantic base */
        success: "rgb(var(--gc-success) / <alpha-value>)",
        danger: "rgb(var(--gc-danger) / <alpha-value>)",
        warning: "rgb(var(--gc-warning) / <alpha-value>)",
        info: "rgb(var(--gc-info) / <alpha-value>)",

        /* semantic soft backgrounds */
        "success-soft": "rgb(var(--gc-success-soft) / <alpha-value>)",
        "danger-soft": "rgb(var(--gc-danger-soft) / <alpha-value>)",
        "warning-soft": "rgb(var(--gc-warning-soft) / <alpha-value>)",
        "info-soft": "rgb(var(--gc-info-soft) / <alpha-value>)",

        /* semantic foregrounds */
        "success-foreground": "rgb(var(--gc-success-foreground) / <alpha-value>)",
        "danger-foreground": "rgb(var(--gc-danger-foreground) / <alpha-value>)",
        "warning-foreground": "rgb(var(--gc-warning-foreground) / <alpha-value>)",
        "info-foreground": "rgb(var(--gc-info-foreground) / <alpha-value>)",

        muted: "rgb(var(--gc-muted) / <alpha-value>)",
        "muted-soft": "rgb(var(--gc-muted-soft) / <alpha-value>)",
        "muted-foreground": "rgb(var(--gc-muted-foreground) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace"],
      },
      fontSize: {
        body: ["1rem", { lineHeight: "1.6" }],
      },
      borderRadius: {
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
}
