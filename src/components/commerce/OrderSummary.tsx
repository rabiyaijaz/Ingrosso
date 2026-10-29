"use client"

import { clx } from "@medusajs/ui"
import { GradeBadge } from "@/components/catalog/Grade"
import { PartIcon } from "@/components/catalog/PartIcon"
import { CutoffCountdown } from "@/components/layout/CutoffCountdown"
import type { GradeId, Money } from "@/lib/catalog"
import { formatMoney } from "@/lib/money"
import { FREE_SHIPPING_FROM, VAT_RATE } from "@/lib/totals"
import { Figure } from "./Figure"
import { CardIcon } from "./ChoiceCard"
import { ShoppingBag, Sparkles } from "@medusajs/icons"

export type SummaryLine = { slug: string; name: string; sku: string; category: string; grade: GradeId | null; qty: number; total: Money }

// The order summary beside checkout: each part with its glass icon and grade,
// the total on an accent band, and below it a delivery meter card that
// drives a little truck toward free delivery. Names wrap rather than being cut off.
export function OrderSummary({
  lines,
  totals,
  masked,
  freeShippingApplies,
}: {
  lines: SummaryLine[]
  totals: { subtotal: Money; shipping: Money; vat: Money; total: Money }
  masked: boolean
  freeShippingApplies: boolean
}) {
  const money = (m: Money) => (masked ? "—" : formatMoney(m))
  const units = lines.reduce((n, l) => n + l.qty, 0)
  const progress = Math.min(1, totals.subtotal / FREE_SHIPPING_FROM)
  const left = FREE_SHIPPING_FROM - totals.subtotal

  return (
    <div className="flex h-fit flex-col gap-3 lg:sticky lg:top-6">
    <aside aria-label="Order summary" className="ig-summary flex flex-col overflow-hidden rounded-2xl bg-ui-bg-base shadow-elevation-card-rest">
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <h2 className="flex items-center gap-3 txt-large-plus">
          <CardIcon><ShoppingBag /></CardIcon>
          Your order
        </h2>
        <span className="rounded-full bg-ui-tag-blue-bg px-2.5 py-0.5 txt-compact-small-plus text-ui-tag-blue-text">
          <Figure>{lines.length}</Figure> {lines.length === 1 ? "part" : "parts"} · <Figure>{units}</Figure> units
        </span>
      </div>

      <ul className="flex flex-col px-3 pt-3">
        {lines.map((l) => (
          <li key={l.slug} className="ig-summary__line flex gap-3 rounded-xl p-2">
            <span className="relative shrink-0">
              <PartIcon category={l.category} size="lg" />
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ig-blue px-1 txt-compact-xsmall-plus text-ig-on-accent shadow-[0_0_0_2px_var(--bg-base)]">
                <Figure>{l.qty}</Figure>
                <span className="sr-only"> units</span>
              </span>
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="txt-compact-small-plus leading-5 text-ui-fg-base">{l.name}</span>
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 txt-compact-xsmall text-ui-fg-subtle">
                {l.grade && <GradeBadge grade={l.grade} />}
                <Figure>{l.sku}</Figure>
              </span>
            </span>
            <Figure className="shrink-0 txt-compact-small-plus">{money(l.total)}</Figure>
          </li>
        ))}
      </ul>

      <dl className="flex flex-col gap-2 px-5 pb-4 pt-4 txt-compact-small">
        <Row label="Subtotal" value={money(totals.subtotal)} />
        <Row label="Shipping" value={totals.shipping === 0 ? "Free" : money(totals.shipping)} />
        <Row label={`VAT ${VAT_RATE}%`} value={money(totals.vat)} />
      </dl>

      <div className="ig-surface-blue flex items-end justify-between gap-3 px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="txt-compact-small text-ig-on-slate-soft">Total to pay</span>
          <span className="flex items-center gap-1.5 txt-compact-xsmall text-ig-on-slate-soft"><CutoffCountdown /></span>
        </div>
        <Figure className="text-[26px] font-medium leading-8 tracking-[-0.02em]">{money(totals.total)}</Figure>
      </div>
    </aside>

      {/* Free delivery meter, its own card under the summary: the truck drives along as the order grows */}
      {freeShippingApplies && !masked && (
        <div className="flex items-start gap-3 rounded-2xl bg-ui-bg-base p-4 shadow-elevation-card-rest">
          <CardIcon><Sparkles /></CardIcon>
          <div className="min-w-0 flex-1">
          <p className="txt-compact-small text-ui-fg-base">
            {left > 0 ? (
              <>
                <Figure className="txt-compact-small-plus">{formatMoney(left)}</Figure> more for free delivery
              </>
            ) : (
              <span className="txt-compact-small-plus">Free delivery unlocked</span>
            )}
          </p>
          <div className="relative mt-3 h-2 rounded-full bg-ui-bg-component" role="progressbar" aria-label="Towards free delivery" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
            <span className="ig-summary__fill absolute inset-y-0 left-0 rounded-full" style={{ width: `${progress * 100}%` }} />
            <span aria-hidden className={clx("ig-summary__truck absolute -top-[18px]", left <= 0 && "is-done")} style={{ left: `calc(${progress * 100}% - 11px)` }}>
              <svg viewBox="0 0 24 16" width="22" height="15" fill="none">
                <path d="M1.5 3.2c0-.66.54-1.2 1.2-1.2h10.1c.66 0 1.2.54 1.2 1.2V12H1.5z" fill="currentColor" />
                <path d="M14 5.5h4.3c.4 0 .78.2 1 .53l2.4 3.4c.14.2.2.44.2.68V12H14z" fill="currentColor" opacity=".7" />
                <circle cx="5.5" cy="12.6" r="2" fill="currentColor" stroke="var(--bg-base)" strokeWidth="1.2" />
                <circle cx="17.5" cy="12.6" r="2" fill="currentColor" stroke="var(--bg-base)" strokeWidth="1.2" />
              </svg>
            </span>
          </div>
          <p className="mt-2 txt-compact-xsmall text-ui-fg-subtle">PostNL is free on orders over {formatMoney(FREE_SHIPPING_FROM)} before VAT.</p>
          </div>
        </div>
      )}

    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ui-fg-subtle">{label}</dt>
      <dd><Figure>{value}</Figure></dd>
    </div>
  )
}
