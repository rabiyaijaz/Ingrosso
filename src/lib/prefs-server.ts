import "server-only"
import { cookies } from "next/headers"
import { LAB } from "./lab"
import { DEFAULT_LANG, DEFAULT_MODE, LANG_COOKIE, MODE_COOKIE, MODE_THEME, isLang, isMode, langOf } from "./prefs"
import { THEME_COOKIE, isTheme, type ThemeId } from "./themes"

export async function getPrefs() {
  const store = await cookies()
  const m = store.get(MODE_COOKIE)?.value
  const l = store.get(LANG_COOKIE)?.value
  const mode = isMode(m) ? m : DEFAULT_MODE
  const lang = isLang(l) ? l : DEFAULT_LANG
  // The lab toolbar can still preview any theme; picking Light or Dark clears it
  const lab = LAB ? store.get(THEME_COOKIE)?.value : undefined
  const theme: ThemeId = isTheme(lab) ? lab : MODE_THEME[mode]
  return { mode, lang, dir: langOf(lang).dir, theme }
}
