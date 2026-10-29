"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { clx, toast } from "@medusajs/ui"
import { ArchiveBox, Hashtag, Tag } from "@medusajs/icons"
import { addProduct } from "@/app/admin-actions"
import { DeviceFinder } from "@/components/catalog/DeviceFinder"
import { PartIcon } from "@/components/catalog/PartIcon"
import { Button } from "@/components/ui/Button"
import { WithIcon } from "@/components/ui/WithIcon"
import { Field, NativeSelect, fieldClass } from "./Fields"
import { tierUnit } from "@/lib/admin/pricing"
import type { Tier } from "@/lib/admin/types"
import { formatMoney } from "@/lib/money"
import type { DeviceTree } from "@/lib/public"
import { routes } from "@/lib/routes"

type Grade = { id: string; label: string; family: string; rank: number }
type Cat = { slug: string; name: string; plural: string; icon?: string }

const PREFIX: Record<string, string> = { screens: "SCR", batteries: "BAT", "charging-ports": "CHG", cameras: "CAM", "back-glass": "BKG", "small-parts": "SML", tools: "TLS" }

// Euros typed as text, turned into integer ten-thousandths without floats (R3)
const toMoney = (s: string) => {
  const m = s.replace(",", ".").match(/^\s*(\d{1,6})(?:\.(\d{0,4}))?\s*$/)
  if (!m) return 0
  return Number(m[1]) * 10000 + Number((m[2] ?? "").padEnd(4, "0"))
}

export function ProductForm({ tree, grades, categories, tiers }: { tree: DeviceTree; grades: Grade[]; categories: Cat[]; tiers: Tier[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [name, setName] = useState("")
  const [category, setCategory] = useState(categories[0].slug)
  const [grade, setGrade] = useState("")
  const [models, setModels] = useState<string[]>([])
  const [skuEdited, setSkuEdited] = useState<string | null>(null)
  const [price, setPrice] = useState("")
  const [onHand, setOnHand] = useState("0")
  const [step, setStep] = useState("1")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const allModels = useMemo(() => tree.flatMap((b) => b.series.flatMap((s) => s.models)), [tree])
  const firstCode = allModels.find((m) => m.slug === models[0])?.codes[0]
  const rank = grades.find((g) => g.id === grade)?.rank
  const suggested = `${PREFIX[category] ?? category.slice(0, 3).toUpperCase()}-${firstCode ?? "XXXX"}${rank ? `-${String(rank).padStart(2, "0")}` : ""}`
  const sku = skuEdited ?? suggested
  const list = toMoney(price)

  // Flips each given model: picked ones go, the rest are added
  const toggle = (slugs: string[]) =>
    setModels((m) => [...m.filter((x) => !slugs.includes(x)), ...slugs.filter((x) => !m.includes(x))])

  const submit = () =>
    start(async () => {
      const res = await addProduct(
        JSON.stringify({ name, sku: sku.toUpperCase(), category, grade: grade || null, models, list, onHand: Math.max(0, parseInt(onHand) || 0), orderStep: Math.max(1, parseInt(step) || 1) })
      )
      if (!res.ok) {
        setErrors(res.errors)
        toast.error("Check the highlighted fields")
        return
      }
      toast.success("Product added", { description: name })
      router.push(routes.admin.products())
    })

  const families = ["Genuine", "Aftermarket", "Third-party"]

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]"
      noValidate
    >
      {/* The main action at the top, in view without scrolling */}
      <div className="flex justify-end gap-2 xl:col-span-2">
        <Button type="button" variant="secondary" onClick={() => router.push(routes.admin.products())}>Cancel</Button>
        <Button type="submit" isLoading={pending}>Add product</Button>
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <section className="ig-card flex flex-col gap-4 p-5">
          <h2 className="txt-compact-medium-plus">The part</h2>
          <Field label="Name" hint="Model, part and grade, as buyers search for it." error={errors.name} htmlFor="name">
            <WithIcon icon={<Tag />}><input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="iPhone 16 Pro screen assembly, Soft OLED" className={fieldClass} aria-invalid={!!errors.name} /></WithIcon>
          </Field>
          <div className="flex flex-col gap-1.5">
            <span className="txt-compact-small-plus">Category</span>
            <div role="radiogroup" aria-label="Category" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {categories.map((c) => {
                const on = c.slug === category
                return (
                  <button
                    key={c.slug}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setCategory(c.slug)}
                    className={clx(
                      "flex items-center gap-2 rounded-xl p-2.5 text-left txt-compact-small-plus outline-none transition-shadow focus-visible:shadow-borders-focus",
                      on ? "bg-ui-bg-highlight shadow-borders-interactive-with-active" : "shadow-borders-base hover:bg-ui-bg-base-hover"
                    )}
                  >
                    <PartIcon category={c.icon ?? c.slug} size="sm" />
                    {c.plural}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Grade" error={errors.grade} htmlFor="grade">
              <NativeSelect id="grade" value={grade} onChange={(e) => setGrade(e.target.value)}>
                <option value="">Not graded (tools, small parts)</option>
                {families.map((f) => (
                  <optgroup key={f} label={f}>
                    {grades.filter((g) => g.family === f).map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
                  </optgroup>
                ))}
              </NativeSelect>
            </Field>
            <Field label="SKU" hint={skuEdited === null ? "Suggested from the category, first model and grade." : undefined} error={errors.sku} htmlFor="sku">
              <WithIcon icon={<Hashtag />}><input id="sku" value={sku} onChange={(e) => setSkuEdited(e.target.value.toUpperCase())} className={clx(fieldClass, "font-mono")} aria-invalid={!!errors.sku} /></WithIcon>
            </Field>
          </div>
        </section>

        <section className="ig-card flex flex-col gap-4 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="txt-compact-medium-plus">Fits these models</h2>
            <span className="txt-compact-small text-ui-fg-subtle">{models.length} selected</span>
          </div>
          {errors.models && <p className="txt-compact-small text-ui-fg-error">{errors.models}</p>}
          {/* The same Brand → Series → Model columns as the store's device finder */}
          <DeviceFinder tree={tree} pick={{ selected: models, onToggle: toggle }} className="-mx-2" />
        </section>
      </div>

      <div className="flex flex-col gap-4">
        <section className="ig-card flex flex-col gap-4 p-5">
          <h2 className="txt-compact-medium-plus">Price and stock</h2>
          <Field label="List price, one unit, before VAT" hint="Every price tier is calculated from this." error={errors.list} htmlFor="price">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 txt-compact-small text-ui-fg-muted">€</span>
              <input id="price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className={clx(fieldClass, "pl-7 font-mono")} aria-invalid={!!errors.list} />
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="On hand" htmlFor="onhand">
              <WithIcon icon={<ArchiveBox />}><input id="onhand" inputMode="numeric" value={onHand} onChange={(e) => setOnHand(e.target.value.replace(/\D/g, ""))} className={clx(fieldClass, "font-mono")} /></WithIcon>
            </Field>
            <Field label="Sold in multiples of" htmlFor="step">
              <input id="step" inputMode="numeric" value={step} onChange={(e) => setStep(e.target.value.replace(/\D/g, ""))} className={clx(fieldClass, "font-mono")} />
            </Field>
          </div>
        </section>

        <section className="ig-card flex flex-col gap-3 p-5">
          <h2 className="txt-compact-medium-plus">What each tier pays</h2>
          {list > 0 ? (
            <table className="w-full txt-compact-small">
              <thead>
                <tr className="text-left text-ui-fg-subtle">
                  <th className="pb-2 font-normal">Tier</th>
                  <th className="pb-2 text-right font-normal">1 unit</th>
                  <th className="pb-2 text-right font-normal">25 units</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((t) => (
                  <tr key={t.id} className="border-t border-ui-border-base">
                    <td className="py-2">{t.name}</td>
                    <td className="py-2 text-right font-mono">{formatMoney(tierUnit(t, list, category, (grade || null) as never, 1))}</td>
                    <td className="py-2 text-right font-mono text-ui-fg-subtle">{formatMoney(tierUnit(t, list, category, (grade || null) as never, 25))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="txt-small text-ui-fg-subtle">Enter a list price to see what every tier will pay, including category and grade rules.</p>
          )}
        </section>
      </div>
    </form>
  )
}
