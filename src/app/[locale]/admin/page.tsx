import Link from "next/link"
import { StatusBadge, clx } from "@medusajs/ui"
import { ArrowDownMini, ArrowUpMini, ExclamationCircle, Plus, ReceiptPercent, ShoppingCart, TruckFast, Buildings, ArchiveBox } from "@medusajs/icons"
import { decideApplication } from "@/app/admin-actions"
import { BarList, DailyBars, Sparkline } from "@/components/admin/Charts"
import { NativeSelect } from "@/components/admin/Fields"
import { AdminHeader, Panel, PanelLink, ago, shortDate } from "@/components/admin/Kit"
import { Figure } from "@/components/commerce/Figure"
import { CutoffCountdown } from "@/components/layout/CutoffCountdown"
import { Button } from "@/components/ui/Button"
import { SubmitButton } from "@/components/ui/SubmitButton"
import { ORDER_STATUS, getCustomers, getOrders, getTiers } from "@/lib/admin/data"
import { dashboardStats, euroShort, euroWhole, niceMax } from "@/lib/admin/stats"
import { formatMoney } from "@/lib/money"
import { routes } from "@/lib/routes"

export const metadata = { title: "Overview" }

// The trade desk's home. Read top to bottom: what needs a person now, how
// trade is going, where it comes from, then the latest activity.
export default async function AdminHome() {
  const [orders, customers, tiers] = await Promise.all([getOrders(), getCustomers(), getTiers()])
  const s = dashboardStats(orders, customers)
  const tierName = (id: string | null) => tiers.find((t) => t.id === id)?.name ?? "No tier"
  const nameOf = (id: string) => customers.find((c) => c.id === id)?.company ?? id
  const scale = niceMax(Math.max(...s.days.map((d) => d.value)))
  const hour = new Date().toLocaleString("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/Amsterdam" })
  const greeting = +hour < 12 ? "Good morning" : +hour < 18 ? "Good afternoon" : "Good evening"

  return (
    <>
      <AdminHeader
        title={greeting}
        description={
          <span className="flex flex-wrap items-center gap-x-2">
            <TruckFast className="text-ui-fg-muted" />
            <CutoffCountdown />
            <span aria-hidden>·</span>
            <span>{s.toPick.length} orders still to pick</span>
          </span>
        }
      >
        <Button asChild variant="secondary" iconLeft={<ReceiptPercent />}><Link href={routes.admin.pricing()}>Price tiers</Link></Button>
        <Button asChild iconLeft={<Plus />}><Link href={routes.admin.newProduct()}>Add product</Link></Button>
      </AdminHeader>

      {/* 1 · Needs you now: every item is a count with the action next to it */}
      <section aria-label="Needs attention" className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AttentionCard
          href={routes.admin.customers({ status: "pending" })}
          icon={<Buildings />}
          tone={s.pending.length ? "warn" : "ok"}
          count={s.pending.length}
          title="Applications to review"
          detail={s.pending.length ? `Oldest waiting ${ago(s.pending[0].appliedAt).replace(" ago", "")}` : "Nobody waiting"}
        />
        <AttentionCard
          href={routes.admin.orders({ status: "new" })}
          icon={<ShoppingCart />}
          tone={s.toPick.length ? "info" : "ok"}
          count={s.toPick.length}
          title="Orders to pick today"
          detail="Ship before the 18:00 cut-off"
        />
        <AttentionCard
          href={routes.admin.orders({ payment: "overdue" })}
          icon={<ExclamationCircle />}
          tone={s.overdue.count ? "bad" : "ok"}
          count={s.overdue.count}
          title="Overdue invoices"
          detail={s.overdue.count ? `${formatMoney(s.overdue.value)} outstanding` : "All paid on time"}
        />
        <AttentionCard
          href={routes.admin.products({ stock: "low" })}
          icon={<ArchiveBox />}
          tone={s.lowStock.length ? "warn" : "ok"}
          count={s.lowStock.length}
          title="Parts running low"
          detail="Sold this month, 12 or fewer left"
        />
      </section>

      {/* 2 · How trade is going */}
      <section aria-label="Key figures" className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Revenue, last 7 days" value={euroWhole(s.revenue.value)} delta={s.revenue.delta} spark={s.revenue.spark} note="before VAT" />
        <Kpi label="Orders, last 7 days" value={String(s.orders.value)} delta={s.orders.delta} spark={s.orders.spark} />
        <Kpi label="Average order" value={euroWhole(s.aov.value)} delta={s.aov.delta} note="last 7 days" />
        <Kpi label="Active trade accounts" value={String(s.activeAccounts)} note={`${s.pending.length} waiting for approval`} />
      </section>

      <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        <Panel
          title="Revenue per day"
          action={
            <span className="txt-compact-small text-ui-fg-subtle">
              Last 30 days · <Figure className="text-ui-fg-base">{euroWhole(s.month.value)}</Figure> from {s.month.orders} orders
            </span>
          }
        >
          <DailyBars
            scaleMax={scale}
            scaleLabel={euroShort(scale)}
            days={s.days.map((d) => ({ label: d.label, long: d.long, value: d.value, display: formatMoney(d.value), orders: d.orders, weekend: d.weekend }))}
          />
          <p className="mt-2 txt-compact-xsmall text-ui-fg-muted">Weekends in the lighter shade. Cancelled orders excluded.</p>
        </Panel>

        {/* Applications inline: approve with a tier without leaving the page */}
        <Panel title="Applications" action={<PanelLink href={routes.admin.customers({ status: "pending" })}>All</PanelLink>} bodyClassName="flex flex-col gap-3">
          {s.pending.length === 0 && <p className="txt-small text-ui-fg-subtle">No applications waiting.</p>}
          {s.pending.slice(0, 3).map((c) => (
            <div key={c.id} className="ig-inset p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link href={routes.admin.customer(c.id)} className="block truncate txt-compact-small-plus hover:underline">{c.company}</Link>
                  <p className="txt-compact-xsmall text-ui-fg-subtle">{c.type} · {c.city}, {c.country} · {ago(c.appliedAt)}</p>
                </div>
                {c.vatChecked ? (
                  <StatusBadge color="green" className="shrink-0">VAT valid</StatusBadge>
                ) : (
                  <StatusBadge color="red" className="shrink-0">VAT not found</StatusBadge>
                )}
              </div>
              {/* A failed tax check needs a person to look, so only Review is offered */}
              {c.vatChecked ? (
                <form action={decideApplication} className="mt-3 flex items-center gap-2">
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="next" value={routes.admin.home()} />
                  <input type="hidden" name="decision" value="approve" />
                  <NativeSelect name="tierId" defaultValue={tiers[0].id} aria-label={`Price tier for ${c.company}`} className="flex-1">
                    {tiers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </NativeSelect>
                  <SubmitButton size="sm" done="Application approved" doneDescription={c.company}>Approve</SubmitButton>
                  <Button asChild size="sm" variant="secondary"><Link href={routes.admin.customer(c.id)}>Review</Link></Button>
                </form>
              ) : (
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="txt-compact-xsmall text-ui-fg-subtle">Check the tax number before approving.</p>
                  <Button asChild size="sm" variant="secondary"><Link href={routes.admin.customer(c.id)}>Review</Link></Button>
                </div>
              )}
            </div>
          ))}
        </Panel>
      </div>

      {/* 3 · Where it comes from */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Revenue by part" action={<span className="txt-compact-small text-ui-fg-subtle">30 days</span>}>
          <BarList rows={s.categories.map((c) => ({ label: c.label, value: c.value, display: euroShort(c.value) }))} />
        </Panel>
        <Panel title="Grade mix" action={<span className="txt-compact-small text-ui-fg-subtle">Share of revenue, 30 days</span>}>
          <GradeMix families={s.families} />
        </Panel>
        <Panel title="Top accounts" action={<PanelLink href={routes.admin.customers()}>Customers</PanelLink>} bodyClassName="pt-1">
          <ul className="flex flex-col divide-y divide-ui-border-base">
            {s.topCustomers.map((r, i) => (
              <li key={r.customer.id} className="flex items-center gap-3 py-2.5">
                <span className="ig-figure w-4 txt-compact-small text-ui-fg-muted">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <Link href={routes.admin.customer(r.customer.id)} className="block truncate txt-compact-small-plus hover:underline">{r.customer.company}</Link>
                  <p className="txt-compact-xsmall text-ui-fg-subtle">{tierName(r.customer.tierId)} · {r.orders} orders</p>
                </div>
                <Figure className="txt-compact-small-plus">{euroShort(r.value)}</Figure>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* 4 · Latest activity */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel title="Latest orders" action={<PanelLink href={routes.admin.orders()}>All orders</PanelLink>} bodyClassName="px-0 pb-2">
          <table className="w-full txt-compact-small">
            <thead>
              <tr className="text-left text-ui-fg-subtle">
                <th className="px-5 py-2 font-normal">Order</th>
                <th className="px-3 py-2 font-normal">Account</th>
                <th className="hidden px-3 py-2 font-normal md:table-cell">Placed</th>
                <th className="px-3 py-2 text-right font-normal">Total</th>
                <th className="px-5 py-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 7).map((o) => (
                <tr key={o.ref} className="border-t border-ui-border-base hover:bg-ui-bg-base-hover">
                  <td className="px-5 py-2.5"><Link href={routes.admin.order(o.ref)} className="text-ui-fg-interactive hover:underline"><Figure>{o.ref}</Figure></Link></td>
                  <td className="max-w-[200px] truncate px-3 py-2.5">{nameOf(o.customerId)}</td>
                  <td className="hidden px-3 py-2.5 text-ui-fg-subtle md:table-cell">{ago(o.placedAt)}</td>
                  <td className="px-3 py-2.5 text-right"><Figure>{formatMoney(o.total)}</Figure></td>
                  <td className="px-5 py-2.5"><StatusBadge color={ORDER_STATUS[o.status].color}>{ORDER_STATUS[o.status].label}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Running low" action={<PanelLink href={routes.admin.products({ stock: "low" })}>Stock</PanelLink>} bodyClassName="pt-1">
          {s.lowStock.length === 0 && <p className="txt-small text-ui-fg-subtle">Nothing selling is running low.</p>}
          <ul className="flex flex-col divide-y divide-ui-border-base">
            {s.lowStock.slice(0, 6).map((r) => (
              <li key={r.product.slug} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate txt-compact-small-plus">{r.product.name}</p>
                  <p className="txt-compact-xsmall text-ui-fg-subtle"><Figure>{r.product.sku}</Figure> · {r.sold} sold in 30 days</p>
                </div>
                {r.available === 0 ? (
                  <StatusBadge color="red">Out</StatusBadge>
                ) : (
                  <StatusBadge color="orange"><Figure>{r.available}</Figure> left</StatusBadge>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <p className="mt-6 txt-compact-xsmall text-ui-fg-muted">
        Sample data for design review, generated for the last 30 days. Amounts before VAT. Today is {shortDate(new Date().toISOString())}.
      </p>
    </>
  )
}

function AttentionCard({ href, icon, tone, count, title, detail }: { href: string; icon: React.ReactNode; tone: "ok" | "info" | "warn" | "bad"; count: number; title: string; detail: string }) {
  const toneClass = { ok: "text-ui-tag-green-icon", info: "text-ui-tag-blue-icon", warn: "text-ui-tag-orange-icon", bad: "text-ui-tag-red-icon" }[tone]
  return (
    <Link href={href} className="ig-card group flex items-center gap-4 p-4 outline-none transition-shadow hover:shadow-elevation-card-hover focus-visible:shadow-borders-focus">
      <span className={clx("ig-icon-frame ig-glass-icon", toneClass)} data-size="lg">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <Figure className="text-[26px] font-medium leading-8 tracking-[-0.02em] text-ui-fg-base">{count}</Figure>
          <span className="txt-compact-small-plus text-ui-fg-base">{title}</span>
        </span>
        <span className="block txt-compact-small text-ui-fg-subtle">{detail}</span>
      </span>
    </Link>
  )
}

function Kpi({ label, value, delta, spark, note }: { label: string; value: string; delta?: number; spark?: number[]; note?: string }) {
  const up = (delta ?? 0) >= 0
  return (
    <div className="ig-card flex flex-col gap-2 p-4">
      <p className="txt-compact-small text-ui-fg-subtle">{label}</p>
      <div className="flex items-end justify-between gap-3">
        <Figure className="text-[28px] font-medium leading-8 tracking-[-0.02em] text-ui-fg-base">{value}</Figure>
        {delta !== undefined && (
          <span className={clx("flex items-center gap-0.5 rounded-full px-1.5 py-0.5 txt-compact-xsmall-plus", up ? "bg-ui-tag-green-bg text-ui-tag-green-text" : "bg-ui-tag-red-bg text-ui-tag-red-text")}>
            {up ? <ArrowUpMini /> : <ArrowDownMini />}
            {Math.abs(delta)}%<span className="sr-only"> {up ? "up" : "down"} on the 7 days before</span>
          </span>
        )}
      </div>
      {spark ? <Sparkline values={spark} /> : <div className="h-8" />}
      <p className="txt-compact-xsmall text-ui-fg-muted">{note ?? (delta !== undefined ? "vs the 7 days before" : "")}{note && delta !== undefined ? " · vs the 7 days before" : ""}</p>
    </div>
  )
}

function GradeMix({ families }: { families: { family: string; share: number; value: number }[] }) {
  // One hue, light to dark by grade family (sequential), plus labels: never colour alone
  const fill = { Genuine: "var(--ig-grade-2)", Aftermarket: "var(--ig-grade-5)", "Third-party": "var(--ig-grade-8)" } as Record<string, string>
  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-4 w-full gap-[2px] overflow-hidden rounded-full" role="img" aria-label={families.map((f) => `${f.family} ${f.share}%`).join(", ")}>
        {families.filter((f) => f.share > 0).map((f) => (
          <span key={f.family} title={`${f.family}: ${f.share}%`} style={{ width: `${f.share}%`, background: fill[f.family] }} />
        ))}
      </div>
      <ul className="flex flex-col gap-2.5">
        {families.map((f) => (
          <li key={f.family} className="flex items-center gap-3 txt-compact-small">
            <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: fill[f.family] }} />
            <span className="flex-1 text-ui-fg-subtle">{f.family}</span>
            <Figure className="text-ui-fg-subtle">{euroShort(f.value)}</Figure>
            <Figure className="w-10 text-right txt-compact-small-plus text-ui-fg-base">{f.share}%</Figure>
          </li>
        ))}
      </ul>
    </div>
  )
}
