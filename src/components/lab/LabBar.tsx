"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { DropdownMenu, Select, clx, toast } from "@medusajs/ui"
import { Button } from "@/components/ui/Button"
import { ArrowPath, ChevronDown, XMark } from "@medusajs/icons"
import { resetPrototype, setCartLine, setLabIcons, setLabListing, setLabTheme, setViewerState } from "@/app/actions"
import { ICON_STYLES, type IconStyle } from "@/lib/icon-styles"
import { LISTING_VARIANTS, type ListingVariant } from "@/lib/listing-variants"
import { PreviewAs } from "@/components/layout/PreviewAs"
import { routes } from "@/lib/routes"
import { THEMES, type ThemeId } from "@/lib/themes"
import type { ViewerState } from "@/lib/viewer-states"

const SAMPLE_PART = { slug: "iphone-17-pro-max-screen-pulled", name: "iPhone 17 Pro Max screen, pulled original" }

const JUMPS: { label: string; href: string }[] = [
  { label: "Landing page", href: routes.home() },
  { label: "Apply (onboarding)", href: routes.apply() },
  { label: "Sign in", href: routes.signIn() },
  { label: "Model listing", href: routes.model("apple", "iphone-17", "iphone-17-pro-max") },
  { label: "Product page", href: routes.product(SAMPLE_PART.slug) },
  { label: "Order", href: routes.cart() },
  { label: "Checkout", href: routes.checkout() },
  { label: "Account", href: routes.account() },
  { label: "Design system", href: routes.system() },
]

// Floating design-lab toolbar: switch account state, take the next step of a
// flow without filling forms, jump anywhere, reset. Lab builds only.
export function LabBar({
  state,
  cartLines,
  theme,
  listing,
  icons,
}: {
  state: ViewerState
  cartLines: number
  theme: ThemeId
  listing: ListingVariant
  icons: IconStyle
}) {
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const [pending, start] = useTransition()

  const run = (fn: () => Promise<unknown>, then?: () => void) =>
    start(async () => {
      await fn()
      then?.()
      router.refresh()
    })

  const next = (() => {
    if (state === "visitor")
      return (
        <>
          <Button size="small" asChild><Link href={routes.apply()}>Start onboarding</Link></Button>
          <Button size="small" variant="secondary" asChild><Link href={routes.signIn()}>Sign in</Link></Button>
        </>
      )
    if (state === "pending" || state === "suspended")
      return (
        <Button size="small" isLoading={pending} onClick={() => run(() => setViewerState("approved"), () => toast.success("Account approved", { description: "Trade price list assigned" }))}>
          {state === "pending" ? "Approve this account" : "Lift suspension"}
        </Button>
      )
    return (
      <>
        <Button
          size="small"
          variant="secondary"
          isLoading={pending}
          onClick={() => run(() => setCartLine(SAMPLE_PART.slug, 1), () => toast.success("Added to order", { description: SAMPLE_PART.name }))}
        >
          Add a sample part
        </Button>
        {cartLines > 0 && (
          <Button size="small" asChild><Link href={routes.checkout()}>Go to checkout</Link></Button>
        )}
      </>
    )
  })()

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-50 flex h-9 items-center gap-2 rounded-full bg-ig-slate px-4 txt-compact-small-plus text-ig-on-slate shadow-elevation-flyout"
      >
        <span className="size-2 rounded-full bg-ig-blue" aria-hidden /> Design lab
      </button>
    )
  }

  return (
    <div
      role="region"
      aria-label="Design lab"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-[1100px] flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-ig-slate px-4 py-3 text-ig-on-slate shadow-elevation-flyout"
    >
      <span className="flex items-center gap-2 txt-compact-small-plus">
        <span className="size-2 rounded-full bg-ig-blue" aria-hidden /> Design lab
      </span>
      <PreviewAs state={state} />
      <label className="flex items-center gap-2">
        <span className="whitespace-nowrap txt-compact-small text-ig-on-slate-soft">Theme</span>
        <Select size="small" value={theme} onValueChange={(v) => run(() => setLabTheme(v as ThemeId))}>
          <Select.Trigger aria-label="Theme" className="h-6 min-w-[140px] bg-ig-slate-2 text-ig-on-slate shadow-none">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {THEMES.map((t) => (
              <Select.Item key={t.id} value={t.id}>{t.label}</Select.Item>
            ))}
          </Select.Content>
        </Select>
      </label>
      <label className="flex items-center gap-2">
        <span className="whitespace-nowrap txt-compact-small text-ig-on-slate-soft">Layout</span>
        <Select size="small" value={listing} onValueChange={(v) => run(() => setLabListing(v as ListingVariant))}>
          <Select.Trigger aria-label="Listing layout" className="h-6 min-w-[170px] bg-ig-slate-2 text-ig-on-slate shadow-none">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {LISTING_VARIANTS.map((t) => (
              <Select.Item key={t.id} value={t.id}>{t.label}</Select.Item>
            ))}
          </Select.Content>
        </Select>
      </label>
      <label className="flex items-center gap-2">
        <span className="whitespace-nowrap txt-compact-small text-ig-on-slate-soft">Icons</span>
        <Select size="small" value={icons} onValueChange={(v) => run(() => setLabIcons(v as IconStyle))}>
          <Select.Trigger aria-label="Part icons" className="h-6 min-w-[130px] bg-ig-slate-2 text-ig-on-slate shadow-none">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {ICON_STYLES.map((t) => (
              <Select.Item key={t.id} value={t.id}>{t.label}</Select.Item>
            ))}
          </Select.Content>
        </Select>
      </label>
      <div className="flex flex-wrap items-center gap-2">{next}</div>
      <div className="ml-auto flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button size="small" variant="transparent" className={clx("text-ig-on-slate hover:bg-ig-slate-2")}>
              Jump to <ChevronDown />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            {JUMPS.map((j) => (
              <DropdownMenu.Item key={j.href} onSelect={() => router.push(j.href)}>{j.label}</DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu>
        <Button
          size="small"
          variant="transparent"
          className="text-ig-on-slate hover:bg-ig-slate-2"
          isLoading={pending}
          onClick={() => run(resetPrototype, () => router.push(routes.home()))}
        >
          <ArrowPath /> Reset
        </Button>
        <button type="button" aria-label="Hide design lab toolbar" onClick={() => setOpen(false)} className="grid size-7 place-items-center rounded-md hover:bg-ig-slate-2">
          <XMark />
        </button>
      </div>
    </div>
  )
}
