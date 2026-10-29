"use client"

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react"
import { Input, Label, Select, Switch, Text, Textarea, clx, toast } from "@medusajs/ui"
import { changePassword, requestCompanyChange, saveAddress, setNotify } from "@/app/actions"
import { Button } from "@/components/ui/Button"
import { SubmitButton } from "@/components/ui/SubmitButton"
import { LANGUAGES, type LangCode } from "@/lib/prefs"
import type { Address } from "@/lib/settings"
import { useLanguage } from "@/components/layout/PrefControls"

// Side nav for the settings page: the same rows as the device finder's
// columns, and it follows the section in view.
export function SettingsNav({ sections }: { sections: { id: string; label: string; icon: React.ReactNode }[] }) {
  const [active, setActive] = useState(sections[0].id)
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e)
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (top) setActive(top.target.id)
      },
      { rootMargin: "-20% 0px -60% 0px" }
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [sections])
  return (
    <nav aria-label="Settings" className="flex flex-col gap-0.5 lg:sticky lg:top-6">
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          aria-current={active === s.id ? "true" : undefined}
          onClick={() => setActive(s.id)}
          className={clx(
            "flex h-10 items-center gap-2.5 rounded-md px-3 txt-compact-small transition-colors [&_svg]:shrink-0",
            active === s.id ? "bg-ui-bg-highlight text-ui-fg-interactive" : "text-ui-fg-base hover:bg-ui-bg-base-hover [&_svg]:text-ui-fg-muted"
          )}
        >
          {s.icon}
          {s.label}
        </a>
      ))}
    </nav>
  )
}

// One address with an Edit form in place. `optional` addresses (billing) can
// fall back to the delivery address.
export function AddressCard({ kind, title, address, fallback }: { kind: "delivery" | "billing"; title: string; address: Address | null; fallback?: string }) {
  const [editing, setEditing] = useState(false)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string>()
  const form = useRef<HTMLFormElement>(null)

  const save = () => {
    const f = new FormData(form.current!)
    const next = { street: String(f.get("street")), postcode: String(f.get("postcode")), city: String(f.get("city")), country: String(f.get("country")) }
    start(async () => {
      const res = await saveAddress(kind, next)
      if (!res.ok) return setError(res.error)
      setError(undefined)
      setEditing(false)
      toast.success(`${title} saved`)
    })
  }
  const clear = () =>
    start(async () => {
      await saveAddress(kind, null)
      toast.success(`${title}: ${fallback}`)
    })

  return (
    <div className="ig-inset flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="txt-compact-small-plus">{title}</span>
          {!editing && (
            <Text size="small" className="text-ui-fg-subtle">
              {address ? [address.street, `${address.postcode} ${address.city}`, address.country].join(", ") : fallback}
            </Text>
          )}
        </div>
        {!editing && (
          <div className="flex shrink-0 gap-2">
            {address && fallback && <Button size="small" variant="ghost" isLoading={pending} onClick={clear}>Use delivery</Button>}
            <Button size="small" variant="secondary" onClick={() => setEditing(true)}>{address ? "Edit" : "Add"}</Button>
          </div>
        )}
      </div>
      {editing && (
        <form
          ref={form}
          className="ig-panel-in flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          <div className="flex gap-2">
            <Button type="submit" size="small" isLoading={pending}>Save</Button>
            <Button type="button" size="small" variant="secondary" onClick={() => { setEditing(false); setError(undefined) }}>Cancel</Button>
          </div>
          {error && <p className="txt-compact-small text-ui-fg-error">{error}</p>}
          <FieldRow id={`${kind}-street`} label="Street and number"><Input id={`${kind}-street`} name="street" defaultValue={address?.street} autoComplete="street-address" /></FieldRow>
          <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
            <FieldRow id={`${kind}-postcode`} label="Postcode"><Input id={`${kind}-postcode`} name="postcode" defaultValue={address?.postcode} autoComplete="postal-code" /></FieldRow>
            <FieldRow id={`${kind}-city`} label="City"><Input id={`${kind}-city`} name="city" defaultValue={address?.city} autoComplete="address-level2" /></FieldRow>
          </div>
          <FieldRow id={`${kind}-country`} label="Country"><Input id={`${kind}-country`} name="country" defaultValue={address?.country} autoComplete="country-name" /></FieldRow>
        </form>
      )}
    </div>
  )
}

function FieldRow({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} size="small" weight="plus">{label}</Label>
      {children}
    </div>
  )
}

// An on/off setting with its explanation; saves as soon as it's flipped
export function NotifySwitch({ id, label, hint, on }: { id: string; label: string; hint: string; on: boolean }) {
  const [, start] = useTransition()
  const [shown, set] = useOptimistic(on)
  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <div>
        <Label htmlFor={`n-${id}`} weight="plus">{label}</Label>
        <Text size="small" className="mt-0.5 text-ui-fg-subtle">{hint}</Text>
      </div>
      <Switch id={`n-${id}`} checked={shown} onCheckedChange={(v) => start(async () => { set(v); await setNotify(id, v) })} />
    </div>
  )
}

// Company details are checked by the trade desk, so changes are a request
export function CompanyChange() {
  const [open, setOpen] = useState(false)
  if (!open) return <Button variant="secondary" size="small" className="w-fit" onClick={() => setOpen(true)}>Request a change</Button>
  return (
    <form action={async (f) => { await requestCompanyChange(f); setOpen(false) }} className="ig-panel-in flex flex-col gap-3">
      <div className="flex gap-2">
        <SubmitButton size="small" done="Sent to the trade desk" doneDescription="They check it and reply by email.">Send request</SubmitButton>
        <Button type="button" size="small" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="change" size="small" weight="plus">What should change?</Label>
        <Textarea id="change" name="change" required rows={3} placeholder="For example: new VAT number after moving, or a new contact person." />
      </div>
    </form>
  )
}

export function PasswordForm() {
  const [error, setError] = useState<string>()
  const form = useRef<HTMLFormElement>(null)
  return (
    <form
      ref={form}
      action={async (f) => { await changePassword(f); form.current?.reset() }}
      onSubmit={(e) => {
        const f = new FormData(e.currentTarget)
        const next = String(f.get("new"))
        const msg = !String(f.get("current")) ? "Enter your current password." : next.length < 10 ? "Use at least 10 characters." : next !== String(f.get("confirm")) ? "The two new passwords don't match." : undefined
        setError(msg)
        if (msg) e.preventDefault()
      }}
      className="flex max-w-[420px] flex-col gap-3"
    >
      <SubmitButton size="small" className="w-fit" done="Password changed">Change password</SubmitButton>
      {error && <p className="txt-compact-small text-ui-fg-error">{error}</p>}
      <FieldRow id="pw-current" label="Current password"><Input id="pw-current" name="current" type="password" autoComplete="current-password" /></FieldRow>
      <FieldRow id="pw-new" label="New password"><Input id="pw-new" name="new" type="password" autoComplete="new-password" /></FieldRow>
      <FieldRow id="pw-confirm" label="New password again"><Input id="pw-confirm" name="confirm" type="password" autoComplete="new-password" /></FieldRow>
      <Text size="xsmall" className="text-ui-fg-muted">At least 10 characters.</Text>
    </form>
  )
}

export function LanguageSelect({ lang }: { lang: LangCode }) {
  const [shown, pick] = useLanguage(lang)
  return (
    <Select value={shown} onValueChange={(v) => pick(v as LangCode)}>
      <Select.Trigger aria-label="Language" className="w-[200px]"><Select.Value /></Select.Trigger>
      <Select.Content>
        {LANGUAGES.map((l) => <Select.Item key={l.code} value={l.code}>{l.name}</Select.Item>)}
      </Select.Content>
    </Select>
  )
}
