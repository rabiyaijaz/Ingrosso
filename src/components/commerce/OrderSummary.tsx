"use client"

import { clx } from "@medusajs/ui"
import { PartIcon } from "@/components/catalog/PartIcon"
import { CutoffCountdown } from "@/components/layout/CutoffCountdown"
import type { GradeId, Money } from "@/lib/catalog"
import { formatMoney } from "@/lib/money"
import { FREE_SHIPPING_FROM, VAT_RATE } from "@/lib/totals"
import { Figure } from "./Figure"
import { CardIcon } from "./ChoiceCard"
import { ShoppingBag } from "@medusajs/icons"

export type SummaryLine = { slug: string; name: string; sku: string; category: string; grade: GradeId | null; qty: number; total: Money }

// The order summary beside checkout, kept light: each part with a small icon,
// the totals, and below it a delivery meter that drives a little truck toward
// free delivery. Names wrap rather than being cut off.
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
      <aside aria-label="Order summary" className="ig-card flex flex-col gap-4 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="flex items-center gap-2 txt-large-plus">
            <CardIcon size="sm"><ShoppingBag /></CardIcon>
            Your order
          </h2>
          <span className="txt-compact-small text-ui-fg-subtle">
            <Figure>{lines.length}</Figure> {lines.length === 1 ? "part" : "parts"} · <Figure>{units}</Figure> units
          </span>
        </div>

        <ul className="flex flex-col gap-3">
          {lines.map((l) => (
            <li key={l.slug} className="flex items-start gap-3">
              <PartIcon category={l.category} size="md" />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="txt-compact-small leading-5 text-ui-fg-base">{l.name}</span>
                <span className="txt-compact-xsmall text-ui-fg-subtle">
                  <Figure>{l.qty}</Figure> × <Figure>{l.sku}</Figure>
                </span>
              </span>
              <Figure className="shrink-0 txt-compact-small">{money(l.total)}</Figure>
            </li>
          ))}
        </ul>

        <dl className="flex flex-col gap-2 border-t border-ui-border-base pt-4 txt-compact-small">
          <Row label="Subtotal" value={money(totals.subtotal)} />
          <Row label="Shipping" value={totals.shipping === 0 ? "Free" : money(totals.shipping)} />
          <Row label={`VAT ${VAT_RATE}%`} value={money(totals.vat)} />
          <div className="flex items-baseline justify-between pt-2">
            <dt className="txt-compact-medium-plus text-ui-fg-base">Total</dt>
            <dd><Figure className="text-[20px] font-medium leading-7">{money(totals.total)}</Figure></dd>
          </div>
        </dl>
        <p className="-mt-2 txt-compact-xsmall text-ui-fg-subtle"><CutoffCountdown /></p>
      </aside>

      {/* Free delivery: one line and a bar under the summary; the truck drives along as the order grows */}
      {freeShippingApplies && !masked && (
        <div className="px-1 pt-1" title={`Free PostNL delivery over ${formatMoney(FREE_SHIPPING_FROM)} before VAT`}>
          <p className="txt-compact-small text-ui-fg-subtle">
            {left > 0 ? (
              <>
                <Figure className="text-ui-fg-base">{formatMoney(left)}</Figure> to free delivery
              </>
            ) : (
              <span className="text-ui-fg-base">Free delivery</span>
            )}
          </p>
          {/* Track in ink, so it reads on the page canvas in every theme */}
          <div className="relative mt-3 h-1.5 rounded-full bg-[color-mix(in_srgb,var(--fg-base)_12%,transparent)]" role="progressbar" aria-label="Towards free delivery" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
            <span className="ig-summary__fill absolute inset-y-0 left-0 rounded-full" style={{ width: `${progress * 100}%` }} />
            <span aria-hidden className={clx("ig-summary__truck absolute -top-[16px]", left <= 0 && "is-done")} style={{ left: `calc(${progress * 100}% - 10px)` }}>
              <svg viewBox="0 0 24 16" width="20" height="13" fill="none">
                <path d="M1.5 3.2c0-.66.54-1.2 1.2-1.2h10.1c.66 0 1.2.54 1.2 1.2V12H1.5z" fill="currentColor" />
                <path d="M14 5.5h4.3c.4 0 .78.2 1 .53l2.4 3.4c.14.2.2.44.2.68V12H14z" fill="currentColor" opacity=".7" />
                <circle cx="5.5" cy="12.6" r="2" fill="currentColor" stroke="var(--ig-paper)" strokeWidth="1.2" />
                <circle cx="17.5" cy="12.6" r="2" fill="currentColor" stroke="var(--ig-paper)" strokeWidth="1.2" />
              </svg>
            </span>
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
