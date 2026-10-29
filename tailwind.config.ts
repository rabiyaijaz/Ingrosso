import type { Config } from "tailwindcss"
import * as presetModule from "@medusajs/ui-preset"

// The preset is CommonJS with no typed default export. A namespace import
// works whether Tailwind loads this file as an ES module (newer Node, where
// require is not defined) or through its own CommonJS loader.
const medusaPreset = ((presetModule as { default?: unknown }).default ?? presetModule) as Config

// Medusa's preset supplies every token class (bg-ui-*, txt-*, shadow-*).
// Ingrosso's colours are set once in src/app/globals.css by overriding the
// CSS variables those classes read, so a reskin is a token change only.
const config: Config = {
  presets: [medusaPreset],
  // Light theme only for now; Medusa's dark tokens apply only under a .dark class.
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@medusajs/ui/dist/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'Roboto Mono'", "ui-monospace", "monospace"],
      },
      colors: {
        ig: {
          paper: "var(--ig-paper)",
          surface: "var(--ig-surface)",
          "on-accent": "var(--ig-on-accent)",
          "on-ink": "var(--ig-on-ink)",
          "paper-2": "var(--ig-paper-2)",
          ink: "var(--ig-ink)",
          "ink-soft": "var(--ig-ink-soft)",
          blue: "var(--ig-blue)",
          "blue-ink": "var(--ig-blue-ink)",
          "blue-wash": "var(--ig-blue-wash)",
          slate: "var(--ig-slate)",
          "slate-2": "var(--ig-slate-2)",
          "on-slate": "var(--ig-on-slate)",
          "on-slate-soft": "var(--ig-on-slate-soft)",
        },
      },
      borderRadius: {
        panel: "var(--ig-radius-panel)",
      },
      maxWidth: {
        page: "var(--ig-page-max)",
      },
    },
  },
}

export default config
