import Link from "next/link"
import { clx } from "@medusajs/ui"
import { EyeSlash, LockClosedSolid } from "@medusajs/icons"
import type { PriceView } from "@/lib/commerce"
import { formatMoney } from "@/lib/money"
import { routes } from "@/lib/routes"
import { Figure } from "./Figure"

type Props = { view: PriceView; size?: "sm" | "lg"; className?: string }

const GATED_COPY = {
  visitor: { line: "Trade price", action: "Apply to see" },
  pending: { line: "Price shown", action: "once approved" },
  suspended: { line: "Account", action: "suspended" },
} as const

// The single renderer for a price in every state (gated, masked, priced).
export function PriceTag({ view, size = "sm", className }: Props) {
  const large = size === "lg"

  if (view.kind === "gated") {
    const copy = GATED_COPY[view.reason]
    return (
      <span className={clx("inline-flex items-center gap-1.5 text-ui-fg-subtle", large ? "txt-medium" : "txt-compact-small", className)}>
        <LockClosedSolid className="shrink-0 text-ui-fg-muted" />
        <span>
          {copy.line}{" "}
          {view.reason === "visitor" ? (
            <Link href={routes.apply()} className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover underline-offset-2 hover:underline">
              {copy.action.toLowerCase()}
            </Link>
          ) : (
            copy.action
          )}
        </span>
      </span>
    )
  }

  if (view.kind === "masked") {
    return (
      <span className={clx("inline-flex items-center gap-1.5 text-ui-fg-muted", large ? "txt-medium" : "txt-compact-small", className)}>
        <EyeSlash className="shrink-0" />
        Price hidden
      </span>
    )
  }

  const from = view.breaks.length > 1 ? view.breaks[view.breaks.length - 1] : null
  return (
    <span className={clx("inline-flex flex-col gap-1 whitespace-nowrap", className)}>
      <Figure className={clx("text-ui-fg-base", large ? "text-[28px] leading-8 font-medium" : "txt-compact-small-plus")}>
        {formatMoney(view.unit)}
      </Figure>
      {from && <BulkPrice qty={from.minQty} unit={formatMoney(from.unit)} large={large} />}
    </span>
  )
}

// The best quantity-break price: a stacked-boxes icon, the quantity it starts
// at, then the price per piece, so the two numbers can't be read as one.
function BulkPrice({ qty, unit, large }: { qty: number; unit: string; large: boolean }) {
  return (
    <span
      title={`${unit} each when you order ${qty} or more`}
      className={clx(
        "inline-flex w-fit items-center gap-1 rounded-full bg-ui-tag-blue-bg py-0.5 pl-1.5 pr-2 text-ui-tag-blue-text",
        large ? "txt-compact-small" : "txt-compact-xsmall"
      )}
    >
      <BoxesIcon />
      <Figure className="font-medium">{qty}+</Figure>
      <span aria-hidden className="text-ui-tag-blue-icon">·</span>
      <Figure>{unit}</Figure>
      <span className="sr-only">each</span>
    </span>
  )
}

function BoxesIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" width="13" height="13" fill="none" className="shrink-0">
      <rect x="1.5" y="8.5" width="6" height="6" rx="1.3" fill="currentColor" opacity=".55" />
      <rect x="8.5" y="8.5" width="6" height="6" rx="1.3" fill="currentColor" opacity=".55" />
      <rect x="5" y="1.5" width="6" height="6" rx="1.3" fill="currentColor" />
    </svg>
  )
}
