// Colour themes defined in src/app/themes.css. "light" is the base theme in
// globals.css. DEFAULT_THEME is what the main app renders; the lab toolbar
// can switch between all of them, stored in a lab-only cookie.
export const THEMES = [
  { id: "light", label: "Current light" },
  { id: "cobalt", label: "Cobalt glass" },
  { id: "obsidian", label: "Obsidian neon" },
  { id: "amber", label: "Luxe amber" },
] as const

export type ThemeId = (typeof THEMES)[number]["id"]

export const DEFAULT_THEME: ThemeId = "light"

export const THEME_COOKIE = "ig_lab_theme"

export const isTheme = (v: string | undefined): v is ThemeId => THEMES.some((t) => t.id === v)
