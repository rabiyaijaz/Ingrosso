import Link from "next/link"
import { StatusBadge } from "@medusajs/ui"
import { Plus } from "@medusajs/icons"
import { AdminHeader, Panel } from "@/components/admin/Kit"
import { Figure } from "@/components/commerce/Figure"
import { Button } from "@/components/ui/Button"
import { SAMPLE_PARTS, TERMS_SHORT, getCustomers, getTiers } from "@/lib/admin/data"
import { tierUnit } from "@/lib/admin/pricing"
import { euroWhole } from "@/lib/admin/stats"
import { CATEGORIES, GRADES, productBySlug } from "@/lib/catalog"
import { listPrice } from "@/lib/commerce"
import { formatMoney } from "@/lib/money"
import { routes } from "@/lib/routes"

export const metadata = { title: "Price tiers" }

const labelFor = (scope: string, target: string) =>
  scope === "category" ? CATEGORIES.find((c) => c.slug === target)?.plural ?? target : scope === "grade" ? GRADES.find((g) => g.id === target)?.label ?? target : target

export default async function PricingPage() {
  const [tiers, customers] = await Promise.all([getTiers(), getCustomers()])
  const parts = SAMPLE_PARTS.map((s) => productBySlug(s)).filter((p) => !!p)

  return (
    <>
      <AdminHeader
        title="Price tiers"
        description="Each tier is a discount off the list price, with quantity breaks and its own rules for categories or grades. Every approved account is on one tier."
      >
        <Button asChild iconLeft={<Plus />}><Link href={routes.admin.tier("new")}>New tier</Link></Button>
      </AdminHeader>

      <div className="mb-6 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
        {tiers.map((t, i) => {
          const n = customers.filter((c) => c.tierId === t.id && c.status === "approved").length
          return (
            <Link key={t.id} href={routes.admin.tier(t.id)} className="group flex flex-col gap-4 rounded-2xl bg-ui-bg-base p-5 shadow-elevation-card-rest outline-none transition-shadow hover:shadow-elevation-card-hover focus-visible:shadow-borders-focus">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="txt-compact-xsmall-plus uppercase tracking-[0.06em] text-ui-fg-muted">Tier {i + 1}</p>
                  <p className="mt-1 text-[20px] font-medium leading-7 tracking-[-0.01em]">{t.name}</p>
                </div>
                {t.custom && <StatusBadge color="purple">Custom</StatusBadge>}
              </div>
              <p className="flex items-baseline gap-1.5">
                <Figure className="text-[32px] font-medium leading-9 tracking-[-0.02em]">{t.discount}%</Figure>
                <span className="txt-compact-small text-ui-fg-subtle">off list</span>
              </p>
              <dl className="flex flex-col gap-1.5 txt-compact-small">
                <Row label="Breaks" value={t.breaks.length ? t.breaks.map((b) => `${b.minQty}+ ${b.pct}%`).join(" · ") : "None"} />
                <Row label="Rules" value={t.rules.length ? t.rules.map((r) => `${labelFor(r.scope, r.target)} ${r.pct > 0 ? "+" : ""}${r.pct}%`).join(" · ") : "None"} />
                <Row label="Terms" value={TERMS_SHORT[t.terms]} />
                <Row label="Minimum" value={t.minOrder ? euroWhole(t.minOrder) : "None"} />
              </dl>
              <p className="mt-auto border-t border-ui-border-base pt-3 txt-compact-small text-ui-fg-subtle">
                <Figure className="text-ui-fg-base">{n}</Figure> account{n === 1 ? "" : "s"} · {t.eligibility}
              </p>
            </Link>
          )
        })}
      </div>

      <Panel title="What each tier pays" action={<span className="txt-compact-small text-ui-fg-subtle">One unit, before VAT, with every rule applied</span>} bodyClassName="px-0 pb-2">
        <div className="overflow-x-auto">
          <table className="w-full txt-compact-small">
            <thead>
              <tr className="text-left text-ui-fg-subtle">
                <th className="px-5 py-2 font-normal">Part</th>
                <th className="px-3 py-2 text-right font-normal">List</th>
                {tiers.map((t) => <th key={t.id} className="whitespace-nowrap px-3 py-2 text-right font-normal last:pr-5">{t.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {parts.map((p) => (
                <tr key={p!.slug} className="border-t border-ui-border-base">
                  <td className="min-w-[240px] px-5 py-2.5">{p!.name}</td>
                  <td className="px-3 py-2.5 text-right"><Figure>{formatMoney(listPrice(p!))}</Figure></td>
                  {tiers.map((t) => (
                    <td key={t.id} className="px-3 py-2.5 text-right last:pr-5"><Figure>{formatMoney(tierUnit(t, listPrice(p!), p!.category, p!.grade))}</Figure></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-16 shrink-0 text-ui-fg-subtle">{label}</dt>
      <dd className="min-w-0 text-ui-fg-base">{value}</dd>
    </div>
  )
}
