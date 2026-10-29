"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { DropdownMenu, toast } from "@medusajs/ui"
import { ArrowRightOnRectangle, ChevronDown, CogSixTooth, EyeSlash, Language, Moon, ReceiptPercent, Sun, User } from "@medusajs/icons"
import { setViewerState, signOut } from "@/app/actions"
import { Button } from "@/components/ui/Button"
import { LANGUAGES, langOf, type LangCode, type Mode } from "@/lib/prefs"
import { routes } from "@/lib/routes"
import type { ViewerState } from "@/lib/viewer-states"
import { useLanguage, useMode } from "./PrefControls"

const STATUS: Partial<Record<ViewerState, string>> = {
  approved: "Approved trade account",
  masked: "Approved · prices hidden",
  pending: "Application under review",
  suspended: "Ordering paused",
}

// The header's account button for signed-in buyers: who you are, where your
// orders and settings are, the two preferences, and sign out.
export function AccountMenu({ company, state, mode, lang }: { company: string; state: ViewerState; mode: Mode; lang: LangCode }) {
  const router = useRouter()
  const [, start] = useTransition()
  const [shownMode, pickMode] = useMode(mode)
  const [shownLang, pickLang] = useLanguage(lang)
  const approved = state === "approved" || state === "masked"

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="transparent" size="large" className="group" aria-label={`Account: ${company}`}>
          <User />
          <span className="hidden lg:inline">Account</span>
          <ChevronDown className="hidden text-ui-fg-muted transition-transform group-data-[state=open]:rotate-180 lg:block" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="z-50 w-[260px]">
        <div className="flex flex-col gap-0.5 px-2 pb-2 pt-1.5">
          <span className="truncate txt-compact-small-plus text-ui-fg-base">{company}</span>
          <span className="txt-compact-xsmall text-ui-fg-subtle">{STATUS[state]}</span>
        </div>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onSelect={() => router.push(routes.account())} className="gap-2">
          <ReceiptPercent className="text-ui-fg-subtle" /> Orders and alerts
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => router.push(routes.accountSettings())} className="gap-2">
          <CogSixTooth className="text-ui-fg-subtle" /> Account settings
        </DropdownMenu.Item>
        {approved && (
          <DropdownMenu.CheckboxItem
            checked={state === "masked"}
            onCheckedChange={(v) => start(async () => { await setViewerState(v ? "masked" : "approved"); router.refresh() })}
            onSelect={(e) => e.preventDefault()}
          >
            <span className="flex items-center gap-2"><EyeSlash className="text-ui-fg-subtle" /> Hide prices on screen</span>
          </DropdownMenu.CheckboxItem>
        )}
        <DropdownMenu.Separator />
        <DropdownMenu.Label>Appearance</DropdownMenu.Label>
        <DropdownMenu.RadioGroup value={shownMode} onValueChange={(v) => pickMode(v as Mode)}>
          <DropdownMenu.RadioItem value="light" onSelect={(e) => e.preventDefault()}>
            <span className="flex items-center gap-2"><Sun className="text-ui-fg-subtle" /> Light</span>
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="dark" onSelect={(e) => e.preventDefault()}>
            <span className="flex items-center gap-2"><Moon className="text-ui-fg-subtle" /> Dark</span>
          </DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
        <DropdownMenu.SubMenu>
          <DropdownMenu.SubMenuTrigger className="gap-2">
            <Language className="text-ui-fg-subtle" /> Language
            <span className="ms-auto txt-compact-xsmall text-ui-fg-muted">{langOf(shownLang).name}</span>
          </DropdownMenu.SubMenuTrigger>
          <DropdownMenu.SubMenuContent className="z-50 min-w-[180px]">
            <DropdownMenu.RadioGroup value={shownLang} onValueChange={(v) => pickLang(v as LangCode)}>
              {LANGUAGES.map((l) => (
                <DropdownMenu.RadioItem key={l.code} value={l.code} dir={l.dir}>{l.name}</DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.SubMenuContent>
        </DropdownMenu.SubMenu>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          className="gap-2"
          onSelect={() =>
            start(async () => {
              await signOut()
              toast.success("Signed out")
              router.push(routes.home())
            })
          }
        >
          <ArrowRightOnRectangle className="text-ui-fg-subtle" /> Sign out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}
