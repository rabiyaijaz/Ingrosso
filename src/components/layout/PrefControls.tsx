"use client"

import { useOptimistic, useTransition } from "react"
import { DropdownMenu, clx } from "@medusajs/ui"
import { ChevronDown, Language, Moon, Sun } from "@medusajs/icons"
import { setLanguage, setMode } from "@/app/actions"
import { LANGUAGES, langOf, type LangCode, type Mode } from "@/lib/prefs"

// Hooks shared by every place the preferences can be changed (top strip,
// account menu, account settings), so they all behave the same.
export function useMode(mode: Mode) {
  const [, start] = useTransition()
  const [shown, set] = useOptimistic(mode)
  return [shown, (m: Mode) => start(async () => { set(m); await setMode(m) })] as const
}
export function useLanguage(lang: LangCode) {
  const [, start] = useTransition()
  const [shown, set] = useOptimistic(lang)
  return [shown, (l: LangCode) => start(async () => { set(l); await setLanguage(l) })] as const
}

// Light / Dark as a two-part pill. `tone="band"` sits on the blue top strip.
export function ModeSwitch({ mode, tone = "surface", className }: { mode: Mode; tone?: "band" | "surface"; className?: string }) {
  const [shown, pick] = useMode(mode)
  return (
    <div role="radiogroup" aria-label="Appearance" className={clx("ig-mode", className)} data-tone={tone}>
      {(["light", "dark"] as const).map((m) => (
        <button key={m} type="button" role="radio" aria-checked={shown === m} aria-label={m === "light" ? "Light" : "Dark"} title={m === "light" ? "Light" : "Dark"} onClick={() => pick(m)} className="ig-mode__opt">
          {m === "light" ? <Sun /> : <Moon />}
        </button>
      ))}
    </div>
  )
}

// Language picker for the top strip: the current language's own name, and a
// menu of all of them in their own script.
export function LanguageMenu({ lang }: { lang: LangCode }) {
  const [shown, pick] = useLanguage(lang)
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger className="ig-band-btn" aria-label={`Language: ${langOf(shown).name}`}>
        <Language />
        <span>{langOf(shown).name}</span>
        <ChevronDown className="opacity-70" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="z-50 min-w-[180px]">
        <DropdownMenu.Label>Language</DropdownMenu.Label>
        <DropdownMenu.RadioGroup value={shown} onValueChange={(v) => pick(v as LangCode)}>
          {LANGUAGES.map((l) => (
            <DropdownMenu.RadioItem key={l.code} value={l.code} dir={l.dir}>{l.name}</DropdownMenu.RadioItem>
          ))}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}

export function PrefControls({ mode, lang, className }: { mode: Mode; lang: LangCode; className?: string }) {
  return (
    <div className={clx("flex items-center gap-1.5", className)}>
      <LanguageMenu lang={lang} />
      <ModeSwitch mode={mode} tone="band" />
    </div>
  )
}
