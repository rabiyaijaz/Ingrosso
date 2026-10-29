import Link from "next/link"
import { AdminHeader, Panel } from "@/components/admin/Kit"
import { PartIcon } from "@/components/catalog/PartIcon"
import { Figure } from "@/components/commerce/Figure"
import { getAdminProducts, getOrders } from "@/lib/admin/data"
import { euroShort } from "@/lib/admin/stats"
import { CATEGORIES, GRADES } from "@/lib/catalog"
import { stockOf } from "@/lib/commerce"
import { routes } from "@/lib/routes"

export const metadata = { title: "Categories" }

// The part categories that drive the store's top bar, filters and pictures.
export default async function CategoriesPage() {
  const [products, orders] = await Promise.all([getAdminProducts(), getOrders()])
  const revenue = new Map<string, number>()
  orders.filter((o) => o.status !== "cancelled").forEach((o) =>
    o.lines.forEach((l) => {
      const p = products.find((x) => x.slug === l.slug)
      if (p) revenue.set(p.category, (revenue.get(p.category) ?? 0) + l.unit * l.qty)
    })
  )

  return (
    <>
      <AdminHeader title="Categories" description="Seven part categories, in the order they appear in the store's top bar." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {CATEGORIES.map((c) => {
          const items = products.filter((p) => p.category === c.slug)
          const out = items.filter((p) => stockOf(p).available === 0).length
          const grades = new Set(items.map((p) => p.grade).filter(Boolean))
          return (
            <Panel key={c.slug} bodyClassName="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <PartIcon category={c.slug} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="txt-compact-medium-plus">{c.plural}</p>
                  <p className="txt-compact-small text-ui-fg-subtle">{c.name} · {grades.size} of {GRADES.length} grades stocked</p>
                </div>
              </div>
              <dl className="grid grid-cols-3 gap-2 rounded-xl bg-ui-bg-subtle p-3">
                <Stat label="Parts" value={String(items.length)} />
                <Stat label="Out of stock" value={String(out)} />
                <Stat label="30-day sales" value={euroShort(revenue.get(c.slug) ?? 0)} />
              </dl>
              <div className="flex gap-3 txt-compact-small-plus">
                <Link href={routes.admin.products({ cat: c.slug })} className="text-ui-fg-interactive hover:underline">Products</Link>
                <Link href={routes.category(c.slug)} className="text-ui-fg-interactive hover:underline">View in store</Link>
              </div>
            </Panel>
          )
        })}
      </div>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="txt-compact-xsmall text-ui-fg-subtle">{label}</dt>
      <dd><Figure className="txt-compact-medium-plus">{value}</Figure></dd>
    </div>
  )
}
