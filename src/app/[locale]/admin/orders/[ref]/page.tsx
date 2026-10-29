import Link from "next/link"
import { notFound } from "next/navigation"
import { StatusBadge, clx } from "@medusajs/ui"
import { CheckMini } from "@medusajs/icons"
import { setOrderStatus } from "@/app/admin-actions"
import { AdminHeader, Panel, shortDate } from "@/components/admin/Kit"
import { Figure } from "@/components/commerce/Figure"
import { Button } from "@/components/ui/Button"
import { ORDER_STATUS, PAYMENT_STATE, TERMS_SHORT, getCustomers, getOrders, getTiers, type OrderStatus } from "@/lib/admin/data"
import { productBySlug } from "@/lib/catalog"
import { formatMoney } from "@/lib/money"
import { routes } from "@/lib/routes"

const FLOW: OrderStatus[] = ["new", "picking", "packed", "shipped", "delivered"]
const NEXT_LABEL: Partial<Record<OrderStatus, string>> = { new: "Start picking", picking: "Mark as packed", packed: "Mark as shipped", shipped: "Mark as delivered" }

export default async function AdminOrderPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params
  const [orders, customers, tiers] = await Promise.all([getOrders(), getCustomers(), getTiers()])
  const o = orders.find((x) => x.ref === ref)
  if (!o) notFound()
  const c = customers.find((x) => x.id === o.customerId)
  const tier = tiers.find((t) => t.id === c?.tierId)
  const at = FLOW.indexOf(o.status)
  const next = at >= 0 && at < FLOW.length - 1 ? FLOW[at + 1] : null

  return (
    <>
      <AdminHeader
        crumbs={[{ label: "Orders", href: routes.admin.orders() }]}
        title={<Figure>{o.ref}</Figure>}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge color={ORDER_STATUS[o.status].color}>{ORDER_STATUS[o.status].label}</StatusBadge>
            <StatusBadge color={PAYMENT_STATE[o.payment].color}>{PAYMENT_STATE[o.payment].label}</StatusBadge>
            Placed {shortDate(o.placedAt)} by {c?.company}
          </span>
        }
      >
        {next && o.status !== "cancelled" && (
          <form action={setOrderStatus}>
            <input type="hidden" name="ref" value={o.ref} />
            <input type="hidden" name="status" value={next} />
            <Button type="submit">{NEXT_LABEL[o.status]}</Button>
          </form>
        )}
      </AdminHeader>

      {/* Progress through the warehouse */}
      {o.status !== "cancelled" && (
        <ol className="mb-6 grid grid-cols-5 gap-2" aria-label="Progress">
          {FLOW.map((s, i) => {
            const done = i <= at
            return (
              <li key={s} className="flex flex-col gap-2">
                <span className={clx("h-1.5 rounded-full", done ? "bg-ig-blue" : "bg-ui-bg-component")} />
                <span className={clx("flex items-center gap-1 txt-compact-small", done ? "text-ui-fg-base" : "text-ui-fg-muted")}>
                  {done && <CheckMini className="text-ui-fg-interactive" />}
                  {ORDER_STATUS[s].label}
                </span>
              </li>
            )
          })}
        </ol>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="Lines" bodyClassName="px-0 pb-2">
          <table className="w-full txt-compact-small">
            <thead>
              <tr className="text-left text-ui-fg-subtle">
                <th className="px-5 py-2 font-normal">Part</th>
                <th className="px-3 py-2 text-right font-normal">Qty</th>
                <th className="hidden px-3 py-2 text-right font-normal sm:table-cell">Unit</th>
                <th className="px-5 py-2 text-right font-normal">Line total</th>
              </tr>
            </thead>
            <tbody>
              {o.lines.map((l, i) => {
                const p = productBySlug(l.slug)
                return (
                  <tr key={i} className="border-t border-ui-border-base">
                    <td className="px-5 py-2.5">
                      <p className="txt-compact-small-plus">{p?.name ?? l.slug}</p>
                      <Figure className="text-ui-fg-subtle">{p?.sku}</Figure>
                    </td>
                    <td className="px-3 py-2.5 text-right"><Figure>{l.qty}</Figure></td>
                    <td className="hidden px-3 py-2.5 text-right sm:table-cell"><Figure>{formatMoney(l.unit)}</Figure></td>
                    <td className="px-5 py-2.5 text-right"><Figure>{formatMoney(l.unit * l.qty)}</Figure></td>
                  </tr>
                )
              })}
              <tr className="border-t border-ui-border-base">
                <td colSpan={3} className="px-5 py-3 text-right txt-compact-small-plus">Total before VAT</td>
                <td className="px-5 py-3 text-right txt-compact-medium-plus"><Figure>{formatMoney(o.total)}</Figure></td>
              </tr>
            </tbody>
          </table>
        </Panel>
        <div className="flex flex-col gap-4">
          <Panel title="Account">
            {c && (
              <div className="flex flex-col gap-1 txt-compact-small">
                <Link href={routes.admin.customer(c.id)} className="txt-compact-small-plus text-ui-fg-interactive hover:underline">{c.company}</Link>
                <span className="text-ui-fg-subtle">{c.contact} · {c.city}, {c.country}</span>
                {tier && <span className="text-ui-fg-subtle">{tier.name} · {TERMS_SHORT[tier.terms]}</span>}
              </div>
            )}
          </Panel>
          {o.status !== "cancelled" && o.status !== "shipped" && o.status !== "delivered" && (
            <Panel title="Cancel">
              <form action={setOrderStatus} className="flex flex-col gap-3">
                <input type="hidden" name="ref" value={o.ref} />
                <input type="hidden" name="status" value="cancelled" />
                <p className="txt-small text-ui-fg-subtle">Releases the reserved stock back to the shelf.</p>
                <Button type="submit" variant="danger">Cancel order</Button>
              </form>
            </Panel>
          )}
        </div>
      </div>
    </>
  )
}
