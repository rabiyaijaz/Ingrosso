import Link from "next/link"
import { StatusBadge } from "@medusajs/ui"
import { AdminHeader, Empty, Panel, Tabs, ago } from "@/components/admin/Kit"
import { Figure } from "@/components/commerce/Figure"
import { Chip } from "@/components/ui/Chip"
import { SearchField } from "@/components/ui/SearchField"
import { CUSTOMER_STATUS, getCustomers, getOrders, getTiers, type CustomerStatus } from "@/lib/admin/data"
import { euroShort } from "@/lib/admin/stats"
import { routes } from "@/lib/routes"

export const metadata = { title: "Customers" }

// Customers and their applications in one place: an application is a
// customer at the first step, so it lives here as a view, not a separate area.
export default async function CustomersPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const [customers, orders, tiers] = await Promise.all([getCustomers(), getOrders(), getTiers()])
  const status = (["pending", "approved", "suspended", "rejected"] as CustomerStatus[]).includes(sp.status as CustomerStatus) ? (sp.status as CustomerStatus) : "all"
  const tier = sp.tier && tiers.some((t) => t.id === sp.tier) ? sp.tier : undefined
  const q = (sp.q ?? "").trim().toLowerCase()

  const spend = (id: string) => orders.filter((o) => o.customerId === id && o.status !== "cancelled").reduce((t, o) => t + o.total, 0)
  const lastOrder = (id: string) => orders.find((o) => o.customerId === id)?.placedAt

  const list = customers
    .filter((c) => status === "all" || c.status === status)
    .filter((c) => !tier || c.tierId === tier)
    .filter((c) => !q || `${c.company} ${c.contact} ${c.email} ${c.vatId} ${c.city}`.toLowerCase().includes(q))
    // Applications first, oldest first (waiting longest); everyone else newest first
    .sort((a, b) => (a.status === "pending" ? -1 : 0) - (b.status === "pending" ? -1 : 0) || (a.status === "pending" && b.status === "pending" ? a.appliedAt.localeCompare(b.appliedAt) : b.appliedAt.localeCompare(a.appliedAt)))

  const count = (s: CustomerStatus | "all") => (s === "all" ? customers.length : customers.filter((c) => c.status === s).length)
  const tab = (id: CustomerStatus | "all", label: string) => ({ id, label, count: count(id), href: routes.admin.customers({ status: id === "all" ? undefined : id, tier, q: sp.q }) })

  return (
    <>
      <AdminHeader title="Customers" description="Trade accounts and applications. Approve an application to give it a price tier and show it prices." />
      <Tabs
        active={status}
        tabs={[tab("pending", "Applications"), tab("approved", "Approved"), tab("suspended", "Suspended"), tab("rejected", "Declined"), tab("all", "All")]}
      />
      <Panel bodyClassName="p-0">
        <form className="flex flex-wrap items-center gap-2 border-b border-ui-border-base p-3" method="get">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <SearchField name="q" defaultValue={sp.q} placeholder="Company, contact, email or VAT number" aria-label="Search customers" className="w-full min-w-0 sm:w-auto sm:max-w-[360px] sm:flex-1" />
          <div className="flex flex-wrap gap-1">
            {tiers.map((t) => (
              <Chip key={t.id} asChild selected={tier === t.id}>
                <Link href={routes.admin.customers({ status: status === "all" ? undefined : status, tier: tier === t.id ? undefined : t.id, q: sp.q })}>{t.name}</Link>
              </Chip>
            ))}
          </div>
        </form>
        {list.length === 0 ? (
          <Empty title={status === "pending" ? "No applications waiting" : "No customers match"}>
            {status === "pending" ? "New applications appear here with their tax number already checked." : "Clear the search or the tier filter to see more."}
          </Empty>
        ) : (
          <div className="ig-no-scrollbar overflow-x-auto">
            <table className="w-full txt-compact-small">
              <thead>
                <tr className="text-left text-ui-fg-subtle">
                  <th className="px-5 py-2.5 font-normal">Company</th>
                  <th className="hidden px-3 py-2.5 font-normal md:table-cell">Type</th>
                  <th className="px-3 py-2.5 font-normal">Status</th>
                  <th className="hidden px-3 py-2.5 font-normal sm:table-cell">Price tier</th>
                  <th className="hidden px-3 py-2.5 text-right font-normal lg:table-cell">Spend, 30 days</th>
                  <th className="hidden px-5 py-2.5 font-normal lg:table-cell">{status === "pending" ? "Applied" : "Last order"}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => {
                  const last = lastOrder(c.id)
                  return (
                    <tr key={c.id} className="border-t border-ui-border-base hover:bg-ui-bg-base-hover">
                      <td className="px-5 py-3">
                        <Link href={routes.admin.customer(c.id)} className="txt-compact-small-plus text-ui-fg-base hover:underline">{c.company}</Link>
                        <p className="text-ui-fg-subtle">{c.contact} · {c.city}, {c.country}</p>
                      </td>
                      <td className="hidden px-3 py-3 text-ui-fg-subtle md:table-cell">{c.type}</td>
                      <td className="px-3 py-3">
                        <StatusBadge color={CUSTOMER_STATUS[c.status].color}>{CUSTOMER_STATUS[c.status].label}</StatusBadge>
                        {c.status === "pending" && !c.vatChecked && <p className="mt-1 text-ui-tag-red-text">VAT number not found</p>}
                      </td>
                      <td className="hidden px-3 py-3 sm:table-cell">{tiers.find((t) => t.id === c.tierId)?.name ?? <span className="text-ui-fg-muted">None yet</span>}</td>
                      <td className="hidden px-3 py-3 text-right lg:table-cell"><Figure>{c.status === "pending" ? "—" : euroShort(spend(c.id))}</Figure></td>
                      <td className="hidden px-5 py-3 text-ui-fg-subtle lg:table-cell">{c.status === "pending" ? ago(c.appliedAt) : last ? ago(last) : "No orders"}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  )
}
