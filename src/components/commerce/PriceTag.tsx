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
    <span className={clx("inline-flex flex-col", className)}>
      <Figure className={clx("text-ui-fg-base", large ? "text-[28px] leading-8 font-medium" : "txt-compact-small-plus")}>
        {formatMoney(view.unit)}
      </Figure>
      {from && (
        <span className={clx("text-ui-fg-subtle", large ? "txt-small" : "txt-compact-xsmall")}>
          <Figure>{formatMoney(from.unit)}</Figure> at <Figure>{from.minQty}+</Figure>
        </span>
      )}
    </span>
  )
}
