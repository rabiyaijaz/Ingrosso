import Link from "next/link"
import { StatusBadge } from "@medusajs/ui"
import { bulkOrderStatus, setOrderStatus } from "@/app/admin-actions"
import { AdminHeader, Empty, Panel, Tabs, ago } from "@/components/admin/Kit"
import { Button } from "@/components/ui/Button"
import { SearchField } from "@/components/ui/SearchField"
import { SubmitButton } from "@/components/ui/SubmitButton"
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

// The step each row can take without opening the order
const ROW_NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string; done: string }>> = {
  new: { to: "picking", label: "Pick", done: "Picking started" },
  picking: { to: "packed", label: "Packed", done: "Marked as packed" },
  shipped: { to: "delivered", label: "Delivered", done: "Marked as delivered" },
}

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
  // The warehouse works oldest first; finished views read newest first
  const oldestFirst = view.id === "open" || view.id === "new"
  if (oldestFirst) list.sort((a, b) => a.placedAt.localeCompare(b.placedAt))
  const fresh = orders.filter((o) => o.status === "new")

  return (
    <>
      <AdminHeader title="Orders" description="Pick, pack and ship before the 18:00 cut-off. Oldest orders come first; move one on from its row, or open it to ship with tracking.">
        {/* The morning's main job in one press: every new order into picking */}
        {fresh.length > 0 && (
          <form action={bulkOrderStatus}>
            <input type="hidden" name="status" value="picking" />
            {fresh.map((o) => <input key={o.ref} type="hidden" name="ref" value={o.ref} />)}
            <SubmitButton done={`${fresh.length} orders into picking`}>Start picking all {fresh.length} new</SubmitButton>
          </form>
        )}
      </AdminHeader>
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
          <SearchField name="q" defaultValue={sp.q} placeholder="Order number or company" aria-label="Search orders" className="sm:max-w-[360px]" />
        </form>
        {list.length === 0 ? (
          <Empty title="No orders here">Try another view or clear the search.</Empty>
        ) : (
          <div className="ig-no-scrollbar overflow-x-auto">
            <table className="w-full txt-compact-small">
              <thead>
                <tr className="text-left text-ui-fg-subtle">
                  <th className="px-5 py-2.5 font-normal">Order</th>
                  <th className="px-3 py-2.5 font-normal">Account</th>
                  <th className="hidden px-3 py-2.5 font-normal md:table-cell">Placed</th>
                  <th className="hidden px-3 py-2.5 text-right font-normal sm:table-cell">Lines</th>
                  <th className="px-3 py-2.5 text-right font-normal">Total</th>
                  <th className="px-3 py-2.5 font-normal">Status</th>
                  <th className="hidden px-3 py-2.5 font-normal lg:table-cell">Payment</th>
                  <th className="px-5 py-2.5 text-right font-normal"><span className="sr-only">Next step</span></th>
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
                    <td className="hidden px-3 py-2.5 lg:table-cell"><StatusBadge color={PAYMENT_STATE[o.payment].color}>{PAYMENT_STATE[o.payment].label}</StatusBadge></td>
                    <td className="whitespace-nowrap px-5 py-1.5 text-right">
                      {/* Shipping asks for tracking, so that step opens the order */}
                      {o.status === "packed" ? (
                        <Button asChild size="sm" variant="secondary"><Link href={routes.admin.order(o.ref)}>Ship</Link></Button>
                      ) : ROW_NEXT[o.status] ? (
                        <form action={setOrderStatus}>
                          <input type="hidden" name="ref" value={o.ref} />
                          <input type="hidden" name="status" value={ROW_NEXT[o.status]!.to} />
                          <SubmitButton size="sm" variant="secondary" done={ROW_NEXT[o.status]!.done} doneDescription={o.ref}>{ROW_NEXT[o.status]!.label}</SubmitButton>
                        </form>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length > 60 && <p className="border-t border-ui-border-base px-5 py-3 txt-compact-small text-ui-fg-subtle">Showing the 60 {oldestFirst ? "oldest" : "newest"} of {list.length}. Search to narrow.</p>}
          </div>
        )}
      </Panel>
    </>
  )
}
