import type { Metadata } from "next"
import { AdminNav } from "@/components/admin/AdminNav"
import { getCustomers, getOrders } from "@/lib/admin/data"

export const metadata: Metadata = { title: { default: "Trade desk", template: "%s · Trade desk · Ingrosso" } }

// The trade desk: the same tokens, glass and components as the store, in a
// working layout (sidebar, wide content). Every admin screen sits in here.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [orders, customers] = await Promise.all([getOrders(), getCustomers()])
  const counts = {
    newOrders: orders.filter((o) => o.status === "new").length,
    applications: customers.filter((c) => c.status === "pending").length,
  }
  return (
    <div className="ig-admin min-h-svh lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="ig-admin-sidebar sticky top-0 z-20 p-3 lg:h-svh lg:p-4">
        <AdminNav counts={counts} />
      </aside>
      <main className="min-w-0 px-[var(--ig-gutter)] pb-28 pt-6 lg:pt-8">{children}</main>
    </div>
  )
}
