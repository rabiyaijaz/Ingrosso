"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Checkbox, Heading, Hint, Input, Label, ProgressTabs, Select, Text, clx } from "@medusajs/ui"
import { Buildings, DocumentText, Envelope, GlobeEurope, Hashtag, Key, MapPin, Phone } from "@medusajs/icons"
import { Button } from "@/components/ui/Button"
import { WithIcon } from "@/components/ui/WithIcon"
import { submitApplication } from "@/app/actions"
import { LAB } from "@/lib/lab"
import { routes } from "@/lib/routes"

// Four-step trade application (BRD: credentials → company → address → review).
// The draft is kept in the browser for this prototype; production stores it on
// the server so it can be finished on another device (ACC-02).

// A small icon at the start of each text field, so it is clear at a glance what goes where
const FIELD_ICON: Partial<Record<string, React.ReactNode>> = {
  email: <Envelope />,
  password: <Key />,
  company: <Buildings />,
  taxId: <DocumentText />,
  phone: <Phone />,
  street: <MapPin />,
  city: <GlobeEurope />,
  postcode: <Hashtag />,
}

type StepId = "login" | "company" | "address" | "review"
const STEPS: { id: StepId; label: string; hint: string }[] = [
  { id: "login", label: "Sign-in", hint: "Email, password" },
  { id: "company", label: "Company", hint: "Tax number" },
  { id: "address", label: "Address", hint: "Where orders go" },
  { id: "review", label: "Review", hint: "Send" },
]

const COUNTRIES = [
  { code: "NL", name: "Netherlands", tax: "VAT number", example: "NL123456789B01" },
  { code: "DE", name: "Germany", tax: "VAT number (USt-IdNr.)", example: "DE123456789" },
  { code: "BE", name: "Belgium", tax: "VAT number", example: "BE0123456789" },
  { code: "FR", name: "France", tax: "VAT number", example: "FR12345678901" },
  { code: "IT", name: "Italy", tax: "VAT number (Partita IVA)", example: "IT12345678901" },
  { code: "ES", name: "Spain", tax: "VAT number (NIF)", example: "ESX1234567X" },
  { code: "GB", name: "United Kingdom", tax: "VAT registration number", example: "GB123456789" },
  { code: "AE", name: "United Arab Emirates", tax: "Tax registration number (TRN)", example: "100123456700003" },
  { code: "PK", name: "Pakistan", tax: "National tax number (NTN)", example: "1234567-8" },
  { code: "BR", name: "Brazil", tax: "CNPJ", example: "12.345.678/0001-90" },
]

type Draft = {
  email: string
  password: string
  company: string
  trade: string
  country: string
  taxId: string
  phone: string
  street: string
  city: string
  postcode: string
  consent: boolean
  reached: number
}

const EMPTY: Draft = { email: "", password: "", company: "", trade: "repair", country: "NL", taxId: "", phone: "", street: "", city: "", postcode: "", consent: false, reached: 0 }
const KEY = "ig_application_draft"

const REQUIRED: Record<StepId, (keyof Draft)[]> = {
  login: ["email", "password"],
  company: ["company", "country", "taxId", "phone"],
  address: ["street", "city", "postcode"],
  review: ["consent"],
}

export function ApplicationForm() {
  const router = useRouter()
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [step, setStep] = useState<StepId>("login")
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({})
  const [loaded, setLoaded] = useState(false)
  const [pending, start] = useTransition()

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const saved = { ...EMPTY, ...JSON.parse(raw), password: "" } as Draft
        setDraft(saved)
        setStep(STEPS[Math.min(saved.reached, 3)].id)
      }
    } catch {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      // Never persist the password with the draft.
      localStorage.setItem(KEY, JSON.stringify({ ...draft, password: "" }))
    } catch {}
  }, [draft, loaded])

  const country = useMemo(() => COUNTRIES.find((c) => c.code === draft.country) ?? COUNTRIES[0], [draft.country])
  const index = STEPS.findIndex((s) => s.id === step)
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const validate = (id: StepId) => {
    if (LAB) return true // design lab: click through without filling the form
    const next: typeof errors = {}
    for (const k of REQUIRED[id]) if (!draft[k]) next[k] = "Required"
    if (id === "login" && draft.email && !/^\S+@\S+\.\S+$/.test(draft.email)) next.email = "Enter an email address like name@shop.nl"
    if (id === "login" && draft.password && draft.password.length < 10) next.password = "Use at least 10 characters"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const next = () => {
    if (!validate(step)) return
    const n = index + 1
    setDraft((d) => ({ ...d, reached: Math.max(d.reached, n) }))
    setStep(STEPS[n].id)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const submit = () => {
    if (!validate("review")) return
    start(async () => {
      await submitApplication()
      try { localStorage.removeItem(KEY) } catch {}
      router.push(routes.account())
    })
  }

  const field = (k: keyof Draft, label: string, props: React.ComponentProps<typeof Input> = {}, hint?: string) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={k} size="small" weight="plus">{label}</Label>
      <WithIcon icon={FIELD_ICON[k]}>
        <Input
          id={k}
          value={String(draft[k])}
          onChange={(e) => set(k, e.target.value as never)}
          aria-invalid={!!errors[k]}
          aria-describedby={errors[k] || hint ? `${k}-hint` : undefined}
          {...props}
        />
      </WithIcon>
      {(errors[k] || hint) && (
        <Hint id={`${k}-hint`} variant={errors[k] ? "error" : "info"}>{errors[k] ?? hint}</Hint>
      )}
    </div>
  )

  return (
    <ProgressTabs value={step} onValueChange={(v) => setStep(v as StepId)} className="flex flex-col gap-8">
      <ProgressTabs.List className="ig-steps">
        {STEPS.map((s, i) => (
          <ProgressTabs.Trigger
            key={s.id}
            value={s.id}
            disabled={i > draft.reached}
            status={i < index || i < draft.reached ? "completed" : i === index ? "in-progress" : "not-started"}
            className="ig-steps__tab"
          >
              {s.label}
          </ProgressTabs.Trigger>
        ))}
      </ProgressTabs.List>

      <ProgressTabs.Content value="login" className="flex flex-col gap-5">
        <StepHead title="Create your sign-in" body="Use the email address your shop already uses for orders and invoices." />
        {field("email", "Work email", { type: "email", autoComplete: "email", placeholder: "orders@yourshop.nl" })}
        {field("password", "Password", { type: "password", autoComplete: "new-password" }, "At least 10 characters")}
      </ProgressTabs.Content>

      <ProgressTabs.Content value="company" className="flex flex-col gap-5">
        <StepHead title="Tell us about the business" body="We approve repair shops and resellers. Your tax number decides how VAT is applied to each invoice." />
        {field("company", "Registered company name", { autoComplete: "organization" })}
        <div className="flex flex-col gap-1.5">
          <Label size="small" weight="plus" id="trade-label">Type of business</Label>
          <Select value={draft.trade} onValueChange={(v) => set("trade", v)}>
            <Select.Trigger aria-labelledby="trade-label"><Select.Value /></Select.Trigger>
            <Select.Content>
              <Select.Item value="repair">Repair shop</Select.Item>
              <Select.Item value="reseller">Reseller or distributor</Select.Item>
              <Select.Item value="both">Repair and resale</Select.Item>
            </Select.Content>
          </Select>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label size="small" weight="plus" id="country-label">Country of registration</Label>
            <Select value={draft.country} onValueChange={(v) => set("country", v)}>
              <Select.Trigger aria-labelledby="country-label"><Select.Value /></Select.Trigger>
              <Select.Content>
                {COUNTRIES.map((c) => <Select.Item key={c.code} value={c.code}>{c.name}</Select.Item>)}
              </Select.Content>
            </Select>
          </div>
          {field("taxId", country.tax, { placeholder: country.example, className: "ig-figure" })}
        </div>
        {field("phone", "Phone", { type: "tel", autoComplete: "tel" }, "Our trade desk calls this number if anything needs checking")}
      </ProgressTabs.Content>

      <ProgressTabs.Content value="address" className="flex flex-col gap-5">
        <StepHead title="Where should orders go?" body="This becomes your first delivery and invoice address. You can add more after approval." />
        {field("street", "Street and number", { autoComplete: "street-address" })}
        <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
          {field("city", "City", { autoComplete: "address-level2" })}
          {field("postcode", "Postcode", { autoComplete: "postal-code" })}
        </div>
        <Text size="small" className="text-ui-fg-subtle">Country: {country.name}</Text>
      </ProgressTabs.Content>

      <ProgressTabs.Content value="review" className="flex flex-col gap-5">
        <StepHead title="Check and send" body="A person on our trade desk reviews every application. You can sign in and see its status at any time." />
        <dl className="grid gap-x-6 gap-y-3 rounded-xl bg-ui-bg-subtle p-5 txt-compact-small sm:grid-cols-[180px_1fr]">
          {[
            ["Email", draft.email],
            ["Company", draft.company],
            ["Business", { repair: "Repair shop", reseller: "Reseller or distributor", both: "Repair and resale" }[draft.trade]],
            [country.tax, draft.taxId],
            ["Phone", draft.phone],
            ["Address", `${draft.street}, ${draft.postcode} ${draft.city}, ${country.name}`],
          ].map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-ui-fg-subtle">{k}</dt>
              <dd className="text-ui-fg-base">{v || "—"}</dd>
            </div>
          ))}
        </dl>
        <div className="flex items-start gap-3">
          <Checkbox id="consent" checked={draft.consent} onCheckedChange={(v) => set("consent", v === true)} aria-describedby={errors.consent ? "consent-hint" : undefined} />
          <div className="flex flex-col gap-1">
            <Label htmlFor="consent" size="small">I accept the trade terms of sale and the privacy statement, and confirm this business is registered at the address above.</Label>
            {errors.consent && <Hint id="consent-hint" variant="error">Please accept to send the application</Hint>}
          </div>
        </div>
      </ProgressTabs.Content>

      <div className={clx("flex items-center gap-3", index > 0 ? "justify-between" : "justify-end")}>
        {index > 0 && (
          <Button variant="secondary" size="large" onClick={() => setStep(STEPS[index - 1].id)}>Back</Button>
        )}
        {step === "review" ? (
          <Button size="large" onClick={submit} isLoading={pending}>Send application</Button>
        ) : (
          <Button size="large" onClick={next}>Continue</Button>
        )}
      </div>
    </ProgressTabs>
  )
}

function StepHead({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-1">
      <Heading level="h2" className="txt-xlarge-plus">{title}</Heading>
      <Text className="text-ui-fg-subtle">{body}</Text>
    </div>
  )
}
