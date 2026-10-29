import Link from "next/link"
import { StatusBadge } from "@medusajs/ui"
import { AdminHeader, Empty, Panel, Tabs, ago } from "@/components/admin/Kit"
import { Figure } from "@/components/commerce/Figure"
import { ORDER_STATUS, PAYMENT_STATE, getCustomers, getOrders, type OrderStatus } from "@/lib/admin/data"
import { formatMoney } from "@/lib/money"
import { routes } from "@/lib/routes"

export const metadata = { title: "Orders" }

// Orders by where they are in the warehouse flow; overdue payment as a filter.
const VIEWS: { id: "open" | OrderStatus | "all"; label: string; match: (s: OrderStatus) => boolean }[] = [
  { id: "open", label: "To fulfil", match: (s) => s === "new" || s === "picking" || s === "packed" },
  { id: "new", label: "New", match: (s) => s === "new" },
  { id: "shipped", label: "Shipped", match: (s) => s === "shipped" },
  { id: "delivered", label: "Delivered", match: (s) => s === "delivered" },
  { id: "cancelled", label: "Cancelled", match: (s) => s === "cancelled" },
  { id: "all", label: "All", match: () => true },
]

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const [orders, customers] = await Promise.all([getOrders(), getCustomers()])
  const view = VIEWS.find((v) => v.id === sp.status) ?? VIEWS[0]
  const overdue = sp.payment === "overdue"
  const q = (sp.q ?? "").trim().toLowerCase()
  const nameOf = (id: string) => customers.find((c) => c.id === id)?.company ?? id

  const list = orders
    .filter((o) => (overdue ? o.payment === "overdue" : view.match(o.status)))
    .filter((o) => !q || `${o.ref} ${nameOf(o.customerId)}`.toLowerCase().includes(q))

  return (
    <>
      <AdminHeader title="Orders" description="Pick, pack and ship before the 18:00 cut-off. Open an order to move it to the next step." />
      <Tabs
        active={overdue ? "overdue" : view.id}
        tabs={[
          ...VIEWS.map((v) => ({ id: v.id, label: v.label, count: orders.filter((o) => v.match(o.status)).length, href: routes.admin.orders({ status: v.id === "open" ? undefined : v.id }) })),
          { id: "overdue", label: "Overdue payment", count: orders.filter((o) => o.payment === "overdue").length, href: routes.admin.orders({ payment: "overdue" }) },
        ]}
      />
      <Panel bodyClassName="p-0">
        <form method="get" className="border-b border-ui-border-base p-3">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          {overdue && <input type="hidden" name="payment" value="overdue" />}
          <input
            name="q"
            type="search"
            defaultValue={sp.q}
            placeholder="Order number or company"
            aria-label="Search orders"
            className="h-9 w-full rounded-full bg-ui-bg-field px-4 txt-compact-small shadow-borders-base outline-none placeholder:text-ui-fg-muted focus:shadow-borders-interactive-with-active sm:max-w-[360px]"
          />
        </form>
        {list.length === 0 ? (
          <Empty title="No orders here">Try another view or clear the search.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full txt-compact-small">
              <thead>
                <tr className="text-left text-ui-fg-subtle">
                  <th className="px-5 py-2.5 font-normal">Order</th>
                  <th className="px-3 py-2.5 font-normal">Account</th>
                  <th className="hidden px-3 py-2.5 font-normal md:table-cell">Placed</th>
                  <th className="hidden px-3 py-2.5 text-right font-normal sm:table-cell">Lines</th>
                  <th className="px-3 py-2.5 text-right font-normal">Total</th>
                  <th className="px-3 py-2.5 font-normal">Status</th>
                  <th className="hidden px-5 py-2.5 font-normal lg:table-cell">Payment</th>
                </tr>
              </thead>
              <tbody>
                {list.slice(0, 60).map((o) => (
                  <tr key={o.ref} className="border-t border-ui-border-base hover:bg-ui-bg-base-hover">
                    <td className="px-5 py-2.5"><Link href={routes.admin.order(o.ref)} className="text-ui-fg-interactive hover:underline"><Figure>{o.ref}</Figure></Link></td>
                    <td className="max-w-[220px] truncate px-3 py-2.5"><Link href={routes.admin.customer(o.customerId)} className="hover:underline">{nameOf(o.customerId)}</Link></td>
                    <td className="hidden whitespace-nowrap px-3 py-2.5 text-ui-fg-subtle md:table-cell">{ago(o.placedAt)}</td>
                    <td className="hidden px-3 py-2.5 text-right sm:table-cell"><Figure>{o.lines.length}</Figure></td>
                    <td className="px-3 py-2.5 text-right"><Figure>{formatMoney(o.total)}</Figure></td>
                    <td className="px-3 py-2.5"><StatusBadge color={ORDER_STATUS[o.status].color}>{ORDER_STATUS[o.status].label}</StatusBadge></td>
                    <td className="hidden px-5 py-2.5 lg:table-cell"><StatusBadge color={PAYMENT_STATE[o.payment].color}>{PAYMENT_STATE[o.payment].label}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length > 60 && <p className="border-t border-ui-border-base px-5 py-3 txt-compact-small text-ui-fg-subtle">Showing the 60 newest of {list.length}. Search to narrow.</p>}
          </div>
        )}
      </Panel>
    </>
  )
}
