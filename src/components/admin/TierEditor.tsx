"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { clx, toast } from "@medusajs/ui"
import { Plus, Trash } from "@medusajs/icons"
import { deleteTier, saveTier } from "@/app/admin-actions"
import { Button } from "@/components/ui/Button"
import { Field, NativeSelect, fieldClass } from "./Fields"
import { tierUnit } from "@/lib/admin/pricing"
import { TERMS, type Tier, type TierRule } from "@/lib/admin/types"
import type { GradeId, Money } from "@/lib/catalog"
import { formatMoney } from "@/lib/money"
import { routes } from "@/lib/routes"

type Opt = { value: string; label: string }
type Part = { name: string; category: string; grade: GradeId | null; list: Money }

const FAMILIES: Opt[] = ["Genuine", "Aftermarket", "Third-party"].map((f) => ({ value: f, label: `${f} grades` }))

// Edits one price tier with a live preview. The customisable part is the
// rules list: extra off (or on) for a category, a grade family or one grade.
export function TierEditor({
  tier,
  categories,
  grades,
  parts,
  canDelete,
  deleteReason,
}: {
  tier: Tier
  categories: Opt[]
  grades: Opt[]
  parts: Part[]
  canDelete: boolean
  deleteReason?: string
}) {
  const router = useRouter()
  const [t, setT] = useState<Tier>(tier)
  const [pending, start] = useTransition()
  const set = <K extends keyof Tier>(k: K, v: Tier[K]) => setT((x) => ({ ...x, [k]: v }))
  const targets = (scope: TierRule["scope"]) => (scope === "category" ? categories : scope === "family" ? FAMILIES : grades)
  const isNew = tier.id === "new"

  const save = () =>
    start(async () => {
      const res = await saveTier(JSON.stringify(t))
      toast.success(isNew ? "Tier created" : "Tier saved", { description: t.name })
      router.push(routes.admin.tier(res.id))
      router.refresh()
    })

  const num = (s: string) => (s === "" || s === "-" ? 0 : Math.round(Number(s)) || 0)

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="flex min-w-0 flex-col gap-4">
        <section className="flex flex-col gap-4 rounded-2xl bg-ui-bg-base p-5 shadow-elevation-card-rest">
          <h2 className="txt-compact-medium-plus">Name and who it is for</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="tname">
              <input id="tname" value={t.name} onChange={(e) => set("name", e.target.value)} placeholder="For example Repair Chain" className={fieldClass} />
            </Field>
            <Field label="Who qualifies" hint="Shown to the trade desk when assigning tiers." htmlFor="elig">
              <input id="elig" value={t.eligibility} onChange={(e) => set("eligibility", e.target.value)} placeholder="Over €5,000 spent in 90 days" className={fieldClass} />
            </Field>
          </div>
          <Field label="Description" htmlFor="desc">
            <input id="desc" value={t.description} onChange={(e) => set("description", e.target.value)} className={fieldClass} />
          </Field>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl bg-ui-bg-base p-5 shadow-elevation-card-rest">
          <h2 className="txt-compact-medium-plus">Discount and terms</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Off the list price" htmlFor="disc">
              <div className="flex items-center gap-3">
                <input id="disc-range" type="range" min={0} max={30} value={t.discount} onChange={(e) => set("discount", num(e.target.value))} className="flex-1 accent-[var(--ig-blue)]" aria-label="Discount slider" />
                <div className="relative w-20">
                  <input id="disc" inputMode="numeric" value={t.discount} onChange={(e) => set("discount", num(e.target.value))} className={clx(fieldClass, "pr-6 text-right font-mono")} />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 txt-compact-small text-ui-fg-muted">%</span>
                </div>
              </div>
            </Field>
            <Field label="Payment terms" htmlFor="terms">
              <NativeSelect id="terms" value={t.terms} onChange={(e) => set("terms", e.target.value as Tier["terms"])}>
                {Object.entries(TERMS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Minimum order, € before VAT" htmlFor="min">
              <input id="min" inputMode="numeric" value={t.minOrder / 10000} onChange={(e) => set("minOrder", num(e.target.value.replace(/\D/g, "")) * 10000)} className={clx(fieldClass, "font-mono")} />
            </Field>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl bg-ui-bg-base p-5 shadow-elevation-card-rest">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="txt-compact-medium-plus">Quantity breaks</h2>
            <span className="txt-compact-small text-ui-fg-subtle">Extra off per line, on top of the discount</span>
          </div>
          <ul className="flex flex-col gap-2">
            {t.breaks.map((b, i) => (
              <li key={i} className="flex items-center gap-2 txt-compact-small">
                <span className="text-ui-fg-subtle">From</span>
                <input aria-label="From quantity" inputMode="numeric" value={b.minQty} onChange={(e) => set("breaks", t.breaks.map((x, j) => (j === i ? { ...x, minQty: num(e.target.value) } : x)))} className={clx(fieldClass, "w-20 font-mono")} />
                <span className="text-ui-fg-subtle">units, a further</span>
                <input aria-label="Extra percent off" inputMode="numeric" value={b.pct} onChange={(e) => set("breaks", t.breaks.map((x, j) => (j === i ? { ...x, pct: num(e.target.value) } : x)))} className={clx(fieldClass, "w-16 font-mono")} />
                <span className="text-ui-fg-subtle">% off</span>
                <Button type="button" variant="ghost" size="sm" iconOnly aria-label="Remove break" onClick={() => set("breaks", t.breaks.filter((_, j) => j !== i))}><Trash /></Button>
              </li>
            ))}
          </ul>
          <Button type="button" variant="secondary" size="sm" iconLeft={<Plus />} className="w-fit" onClick={() => set("breaks", [...t.breaks, { minQty: (t.breaks.at(-1)?.minQty ?? 5) * 2, pct: (t.breaks.at(-1)?.pct ?? 0) + 3 }])}>
            Add a break
          </Button>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl bg-ui-bg-base p-5 shadow-elevation-card-rest">
          <div className="flex flex-col gap-1">
            <h2 className="txt-compact-medium-plus">Custom rules</h2>
            <p className="txt-compact-small text-ui-fg-subtle">Change the price for one category, grade family or grade. Use a minus to charge more, for example to protect margin on genuine parts.</p>
          </div>
          {t.rules.length === 0 && <p className="rounded-xl bg-ui-bg-subtle px-4 py-3 txt-small text-ui-fg-subtle">No rules: the discount and breaks apply to every part.</p>}
          <ul className="flex flex-col gap-2">
            {t.rules.map((r, i) => (
              <li key={r.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-ui-bg-subtle p-2 txt-compact-small">
                <NativeSelect aria-label="Applies to" value={r.scope} className="w-36" onChange={(e) => {
                  const scope = e.target.value as TierRule["scope"]
                  set("rules", t.rules.map((x, j) => (j === i ? { ...x, scope, target: targets(scope)[0].value } : x)))
                }}>
                  <option value="category">Category</option>
                  <option value="family">Grade family</option>
                  <option value="grade">One grade</option>
                </NativeSelect>
                <NativeSelect aria-label="Which" value={r.target} className="min-w-[160px] flex-1" onChange={(e) => set("rules", t.rules.map((x, j) => (j === i ? { ...x, target: e.target.value } : x)))}>
                  {targets(r.scope).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </NativeSelect>
                <div className="relative w-24">
                  <input aria-label="Extra percent off" inputMode="numeric" value={r.pct} onChange={(e) => set("rules", t.rules.map((x, j) => (j === i ? { ...x, pct: num(e.target.value) } : x)))} className={clx(fieldClass, "pr-14 text-right font-mono")} />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 txt-compact-xsmall text-ui-fg-muted">% off</span>
                </div>
                <Button type="button" variant="ghost" size="sm" iconOnly aria-label="Remove rule" onClick={() => set("rules", t.rules.filter((_, j) => j !== i))}><Trash /></Button>
              </li>
            ))}
          </ul>
          <Button type="button" variant="secondary" size="sm" iconLeft={<Plus />} className="w-fit" onClick={() => set("rules", [...t.rules, { id: `r${Date.now()}`, scope: "category", target: categories[0].value, pct: 2 }])}>
            Add a rule
          </Button>
        </section>
      </div>

      <div className="flex flex-col gap-4 xl:sticky xl:top-6 xl:self-start">
        <section className="flex flex-col gap-3 rounded-2xl bg-ui-bg-base p-5 shadow-elevation-card-rest">
          <div className="flex items-baseline justify-between">
            <h2 className="txt-compact-medium-plus">Preview</h2>
            <span className="txt-compact-small text-ui-fg-subtle">Updates as you type</span>
          </div>
          <table className="w-full txt-compact-small">
            <thead>
              <tr className="text-left text-ui-fg-subtle">
                <th className="pb-2 font-normal">Part</th>
                <th className="pb-2 text-right font-normal">List</th>
                <th className="pb-2 text-right font-normal">1</th>
                <th className="pb-2 text-right font-normal">25</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((p) => {
                const one = tierUnit(t, p.list, p.category, p.grade, 1)
                return (
                  <tr key={p.name} className="border-t border-ui-border-base align-top">
                    <td className="py-2 pr-2">{p.name}</td>
                    <td className="py-2 text-right font-mono text-ui-fg-subtle">{formatMoney(p.list)}</td>
                    <td className={clx("py-2 text-right font-mono", one > p.list && "text-ui-tag-red-text")}>{formatMoney(one)}</td>
                    <td className="py-2 text-right font-mono text-ui-fg-subtle">{formatMoney(tierUnit(t, p.list, p.category, p.grade, 25))}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
        <div className="flex gap-2">
          <Button type="button" size="lg" className="flex-1" isLoading={pending} onClick={save}>{isNew ? "Create tier" : "Save tier"}</Button>
          <Button type="button" size="lg" variant="secondary" onClick={() => router.push(routes.admin.pricing())}>Cancel</Button>
        </div>
        {!isNew && (
          <form action={deleteTier} className="flex flex-col gap-2 rounded-2xl bg-ui-bg-base p-4 shadow-elevation-card-rest">
            <input type="hidden" name="id" value={tier.id} />
            <Button type="submit" variant="danger" size="sm" disabled={!canDelete} className="w-fit">Delete tier</Button>
            {!canDelete && <p className="txt-compact-small text-ui-fg-subtle">{deleteReason}</p>}
          </form>
        )}
      </div>
    </div>
  )
}
