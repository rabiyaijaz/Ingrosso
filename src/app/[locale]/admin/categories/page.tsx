import Link from "next/link"
import { StatusBadge } from "@medusajs/ui"
import { ArrowDownMini, ArrowUpMini, EyeMini, EyeSlashMini, PencilSquare, Plus } from "@medusajs/icons"
import { moveCategory, toggleCategory } from "@/app/admin-actions"
import { AdminHeader, Panel } from "@/components/admin/Kit"
import { PartIcon } from "@/components/catalog/PartIcon"
import { Figure } from "@/components/commerce/Figure"
import { Button } from "@/components/ui/Button"
import { SubmitButton } from "@/components/ui/SubmitButton"
import { getAdminProducts, getOrders } from "@/lib/admin/data"
import { euroShort } from "@/lib/admin/stats"
import { GRADES } from "@/lib/catalog"
import { getCategories } from "@/lib/categories"
import { stockOf } from "@/lib/commerce"
import { routes } from "@/lib/routes"

export const metadata = { title: "Categories" }

// The part categories behind the store's top bar, filters and pictures. The
// trade desk adds them, renames them, picks their icon, orders them and
// shows or hides them; the store follows.
export default async function CategoriesPage() {
  const [categories, products, orders] = await Promise.all([getCategories(), getAdminProducts(), getOrders()])
  const revenue = new Map<string, number>()
  orders.filter((o) => o.status !== "cancelled").forEach((o) =>
    o.lines.forEach((l) => {
      const p = products.find((x) => x.slug === l.slug)
      if (p) revenue.set(p.category, (revenue.get(p.category) ?? 0) + l.unit * l.qty)
    })
  )
  const shown = categories.filter((c) => c.visible).length

  return (
    <>
      <AdminHeader title="Categories" description={`${categories.length} categories, ${shown} shown in the store's top bar, in this order.`}>
        <Button asChild iconLeft={<Plus />}><Link href={routes.admin.category("new")}>Add category</Link></Button>
      </AdminHeader>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((c, i) => {
          const items = products.filter((p) => p.category === c.slug)
          const out = items.filter((p) => stockOf(p).available === 0).length
          const grades = new Set(items.map((p) => p.grade).filter(Boolean))
          return (
            <Panel key={c.slug} className={c.visible ? undefined : "opacity-75"} bodyClassName="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <PartIcon category={c.icon} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 txt-compact-medium-plus">
                    {c.plural}
                    {!c.visible && <StatusBadge color="grey">Hidden</StatusBadge>}
                    {c.custom && <StatusBadge color="blue">Added</StatusBadge>}
                  </p>
                  <p className="txt-compact-small text-ui-fg-subtle">{c.name} · {grades.size} of {GRADES.length} grades stocked</p>
                </div>
                {/* Order in the top bar */}
                <div className="flex flex-col gap-0.5">
                  <MoveButton slug={c.slug} dir="up" disabled={i === 0} />
                  <MoveButton slug={c.slug} dir="down" disabled={i === categories.length - 1} />
                </div>
              </div>
              <dl className="ig-inset grid grid-cols-3 gap-2 p-3">
                <Stat label="Parts" value={String(items.length)} />
                <Stat label="Out of stock" value={String(out)} />
                <Stat label="30-day sales" value={euroShort(revenue.get(c.slug) ?? 0)} />
              </dl>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 txt-compact-small-plus">
                <Link href={routes.admin.category(c.slug)} className="flex items-center gap-1 text-ui-fg-interactive hover:underline"><PencilSquare /> Edit</Link>
                <Link href={routes.admin.products({ cat: c.slug })} className="text-ui-fg-interactive hover:underline">Products</Link>
                {c.visible && <Link href={routes.category(c.slug)} className="text-ui-fg-interactive hover:underline">View in store</Link>}
                <form action={toggleCategory} className="ml-auto">
                  <input type="hidden" name="slug" value={c.slug} />
                  <SubmitButton variant="ghost" size="sm" iconLeft={c.visible ? <EyeSlashMini /> : <EyeMini />} done={c.visible ? `${c.plural} hidden from the store` : `${c.plural} shown in the store`}>
                    {c.visible ? "Hide" : "Show"}
                  </SubmitButton>
                </form>
              </div>
            </Panel>
          )
        })}
        <Link
          href={routes.admin.category("new")}
          className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ui-border-strong text-ui-fg-subtle transition-colors hover:border-[var(--ig-blue)] hover:bg-ui-bg-base hover:text-ui-fg-interactive"
        >
          <Plus />
          <span className="txt-compact-medium-plus">Add a category</span>
        </Link>
      </div>
    </>
  )
}

function MoveButton({ slug, dir, disabled }: { slug: string; dir: "up" | "down"; disabled: boolean }) {
  return (
    <form action={moveCategory}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="dir" value={dir} />
      <SubmitButton variant="ghost" size="sm" iconOnly disabled={disabled} aria-label={dir === "up" ? "Move earlier in the top bar" : "Move later in the top bar"} className="disabled:opacity-30">
        {dir === "up" ? <ArrowUpMini /> : <ArrowDownMini />}
      </SubmitButton>
    </form>
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
