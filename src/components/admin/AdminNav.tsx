"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { clx } from "@medusajs/ui"
import { ArchiveBox, BuildingStorefront, Buildings, ChartBar, ListTree, ReceiptPercent, ShoppingCart } from "@medusajs/icons"
import { Logo } from "@/components/brand/Logo"
import { routes } from "@/lib/routes"

// Admin information architecture. Sell (orders) → Customers (with the
// application queue inside, because approving an account is the first step
// of a customer's life, not a separate area) → Catalogue → Pricing.
type Item = { href: string; label: string; icon: React.ReactNode; count?: number; exact?: boolean }

export function AdminNav({ counts }: { counts: { newOrders: number; applications: number; lowStock: number } }) {
  const path = usePathname()
  const groups: { title?: string; items: Item[] }[] = [
    { items: [{ href: routes.admin.home(), label: "Overview", icon: <ChartBar />, exact: true }] },
    {
      title: "Sell",
      items: [
        { href: routes.admin.orders(), label: "Orders", icon: <ShoppingCart />, count: counts.newOrders },
        { href: routes.admin.customers(), label: "Customers", icon: <Buildings />, count: counts.applications },
      ],
    },
    {
      title: "Catalogue",
      items: [
        { href: routes.admin.products(), label: "Products", icon: <ArchiveBox />, count: counts.lowStock },
        { href: routes.admin.categories(), label: "Categories", icon: <ListTree /> },
      ],
    },
    { title: "Pricing", items: [{ href: routes.admin.pricing(), label: "Price tiers", icon: <ReceiptPercent /> }] },
  ]

  const isActive = (it: Item) => (it.exact ? path === it.href : path === it.href || path.startsWith(`${it.href}/`))

  return (
    <nav aria-label="Admin" className="ig-admin-nav flex flex-col gap-6 lg:h-full">
      <div className="flex items-center justify-between gap-2 px-2">
        <Logo size="sm" href={routes.admin.home()} />
        <span className="rounded-full bg-ui-tag-blue-bg px-2 py-0.5 txt-compact-xsmall-plus text-ui-tag-blue-text">Trade desk</span>
      </div>
      <div className="ig-no-scrollbar flex gap-1 overflow-x-auto lg:flex-col lg:gap-5 lg:overflow-visible">
        {groups.map((g, i) => (
          <div key={i} className="flex shrink-0 gap-1 lg:flex-col">
            {g.title && <p className="hidden px-3 pb-1 txt-compact-xsmall-plus uppercase tracking-[0.06em] text-ui-fg-muted lg:block">{g.title}</p>}
            {g.items.map((it) => {
              const active = isActive(it)
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  className={clx(
                    "group flex h-9 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 txt-compact-small-plus outline-none transition-colors focus-visible:shadow-borders-focus",
                    active ? "ig-admin-nav__active" : "text-ui-fg-subtle hover:bg-ui-bg-base-hover hover:text-ui-fg-base"
                  )}
                >
                  <span className={clx("shrink-0", active ? "" : "text-ui-fg-muted group-hover:text-ui-fg-base")}>{it.icon}</span>
                  <span className="flex-1">{it.label}</span>
                  {!!it.count && (
                    // Keyed on the count, so it pops when the queue changes
                    <span key={it.count} className={clx("ig-count-pop min-w-5 rounded-full px-1.5 text-center txt-compact-xsmall-plus", active ? "bg-white/25" : "bg-ui-tag-orange-bg text-ui-tag-orange-text")}>
                      {it.count}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </div>
      <Link
        href={routes.home()}
        className="mt-auto hidden items-center gap-2.5 rounded-xl px-3 py-2 txt-compact-small text-ui-fg-subtle hover:bg-ui-bg-base-hover hover:text-ui-fg-base lg:flex"
      >
        <BuildingStorefront className="text-ui-fg-muted" /> View the store
      </Link>
    </nav>
  )
}
