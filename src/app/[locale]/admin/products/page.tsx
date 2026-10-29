import Link from "next/link"
import { StatusBadge } from "@medusajs/ui"
import { Plus } from "@medusajs/icons"
import { AdminHeader, Empty, Panel, Tabs } from "@/components/admin/Kit"
import { PartIcon } from "@/components/catalog/PartIcon"
import { GradeBadge } from "@/components/catalog/Grade"
import { Figure } from "@/components/commerce/Figure"
import { adjustStock } from "@/app/admin-actions"
import { fieldClass } from "@/components/admin/Fields"
import { Button } from "@/components/ui/Button"
import { Chip } from "@/components/ui/Chip"
import { SearchField } from "@/components/ui/SearchField"
import { SubmitButton } from "@/components/ui/SubmitButton"
import { getAdminProducts, getTiers } from "@/lib/admin/data"
import { tierUnit } from "@/lib/admin/pricing"
import { getCategories } from "@/lib/categories"
import { listPrice, stockOf } from "@/lib/commerce"
import { formatMoney } from "@/lib/money"
import { routes } from "@/lib/routes"

export const metadata = { title: "Products" }

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const [all, tiers, CATEGORIES] = await Promise.all([getAdminProducts(), getTiers(), getCategories()])
  const cat = CATEGORIES.some((c) => c.slug === sp.cat) ? sp.cat : undefined
  const stock = sp.stock === "low" || sp.stock === "out" ? sp.stock : undefined
  const q = (sp.q ?? "").trim().toLowerCase()
  const top = tiers[tiers.length - 1]

  const list = all
    .filter((p) => !cat || p.category === cat)
    .filter((p) => {
      const a = stockOf(p).available
      return !stock || (stock === "out" ? a === 0 : a > 0 && a <= 12)
    })
    .filter((p) => !q || `${p.name} ${p.sku}`.toLowerCase().includes(q))

  const href = (patch: Record<string, string | undefined>) => routes.admin.products({ cat, stock, q: sp.q, ...patch })

  return (
    <>
      <AdminHeader title="Products" description={`${all.length} parts. List price is what the first tier pays for one; every other tier is calculated from it. Book deliveries in from Running low or Out of stock.`}>
        <Button asChild iconLeft={<Plus />}><Link href={routes.admin.newProduct()}>Add product</Link></Button>
      </AdminHeader>
      <Tabs
        active={stock ?? "all"}
        tabs={[
          { id: "all", label: "All", count: all.length, href: href({ stock: undefined }) },
          { id: "low", label: "Running low", count: all.filter((p) => { const a = stockOf(p).available; return a > 0 && a <= 12 }).length, href: href({ stock: "low" }) },
          { id: "out", label: "Out of stock", count: all.filter((p) => stockOf(p).available === 0).length, href: href({ stock: "out" }) },
        ]}
      />
      <Panel bodyClassName="p-0">
        <form method="get" className="flex flex-wrap items-center gap-2 border-b border-ui-border-base p-3">
          {stock && <input type="hidden" name="stock" value={stock} />}
          {cat && <input type="hidden" name="cat" value={cat} />}
          <SearchField name="q" defaultValue={sp.q} placeholder="Name or SKU" aria-label="Search products" className="w-full min-w-0 sm:w-auto sm:max-w-[300px] sm:flex-1" />
          <div className="flex flex-wrap gap-1">
            {CATEGORIES.map((c) => (
              <Chip key={c.slug} asChild selected={cat === c.slug}>
                <Link href={href({ cat: cat === c.slug ? undefined : c.slug })}>
                  <PartIcon category={c.icon} bare className="size-4" />
                  {c.plural}
                </Link>
              </Chip>
            ))}
          </div>
        </form>
        {list.length === 0 ? (
          <Empty title="No products match">Clear the search or a filter.</Empty>
        ) : (
          <div className="ig-no-scrollbar overflow-x-auto">
            <table className="w-full txt-compact-small">
              <thead>
                <tr className="text-left text-ui-fg-subtle">
                  <th className="px-5 py-2.5 font-normal">Part</th>
                  <th className="hidden px-3 py-2.5 font-normal md:table-cell">Grade</th>
                  <th className="px-3 py-2.5 text-right font-normal">List price</th>
                  <th className="hidden px-3 py-2.5 text-right font-normal lg:table-cell">{top.name} price</th>
                  <th className="px-5 py-2.5 text-right font-normal">Available</th>
                  {stock && <th className="px-5 py-2.5 text-right font-normal">Book in</th>}
                </tr>
              </thead>
              <tbody>
                {list.slice(0, 80).map((p) => {
                  const a = stockOf(p).available
                  return (
                    <tr key={p.slug} className="border-t border-ui-border-base hover:bg-ui-bg-base-hover">
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-3">
                          <PartIcon category={p.category} size="md" />
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 txt-compact-small-plus">
                              {p.added ? p.name : <Link href={routes.product(p.slug)} className="hover:underline">{p.name}</Link>}
                              {p.added && <StatusBadge color="blue">Added</StatusBadge>}
                            </p>
                            <Figure className="text-ui-fg-subtle">{p.sku}</Figure>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-3 py-2.5 md:table-cell">{p.grade ? <GradeBadge grade={p.grade} /> : <span className="text-ui-fg-muted">Not graded</span>}</td>
                      <td className="px-3 py-2.5 text-right"><Figure>{formatMoney(listPrice(p))}</Figure></td>
                      <td className="hidden px-3 py-2.5 text-right text-ui-fg-subtle lg:table-cell"><Figure>{formatMoney(tierUnit(top, listPrice(p), p.category, p.grade))}</Figure></td>
                      <td className="px-5 py-2.5 text-right">
                        {a === 0 ? <StatusBadge color="red">Out</StatusBadge> : a <= 12 ? <StatusBadge color="orange"><Figure>{a}</Figure> left</StatusBadge> : <Figure>{a}</Figure>}
                      </td>
                      {/* On the low and out views: book a delivery in without leaving the list */}
                      {stock && (
                        <td className="px-5 py-1.5">
                          <form action={adjustStock} className="flex items-center justify-end gap-1.5">
                            <input type="hidden" name="slug" value={p.slug} />
                            <input name="qty" type="number" min={1} max={9999} required defaultValue={25} aria-label={`Units received for ${p.sku}`} className={`${fieldClass} ig-figure w-20 text-right`} />
                            <SubmitButton size="sm" variant="secondary" done="Stock booked in" doneDescription={p.sku}>Receive</SubmitButton>
                          </form>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {list.length > 80 && <p className="border-t border-ui-border-base px-5 py-3 txt-compact-small text-ui-fg-subtle">Showing 80 of {list.length}. Search or pick a category to narrow.</p>}
          </div>
        )}
      </Panel>
    </>
  )
}
