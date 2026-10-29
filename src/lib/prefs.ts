// Per-person preferences, separate from the trade account: appearance and
// language. Kept in cookies so visitors have them too, and so the server
// renders the right theme and direction with no flash.
import type { ThemeId } from "./themes"

export const MODE_COOKIE = "ig_mode"
export const LANG_COOKIE = "ig_lang"

export const MODES = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
] as const
export type Mode = (typeof MODES)[number]["id"]
export const isMode = (v: string | undefined): v is Mode => MODES.some((m) => m.id === v)

// Light first for everyone; dark is the Obsidian neon theme
export const DEFAULT_MODE: Mode = "light"
export const MODE_THEME: Record<Mode, ThemeId> = { light: "light", dark: "obsidian" }

// Native names, so each person finds their own language. Arabic and Urdu read
// right to left and mirror the layout. The store text is English for now:
// choosing a language sets the direction and remembers the choice.
export const LANGUAGES = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "it", name: "Italiano", dir: "ltr" },
  { code: "de", name: "Deutsch", dir: "ltr" },
  { code: "fr", name: "Français", dir: "ltr" },
  { code: "es", name: "Español", dir: "ltr" },
  { code: "pt", name: "Português", dir: "ltr" },
  { code: "tr", name: "Türkçe", dir: "ltr" },
  { code: "zh", name: "中文", dir: "ltr" },
  { code: "ar", name: "العربية", dir: "rtl" },
  { code: "ur", name: "اردو", dir: "rtl" },
] as const
export type LangCode = (typeof LANGUAGES)[number]["code"]
export const isLang = (v: string | undefined): v is LangCode => LANGUAGES.some((l) => l.code === v)
export const DEFAULT_LANG: LangCode = "en"
export const langOf = (code: LangCode) => LANGUAGES.find((l) => l.code === code)!
