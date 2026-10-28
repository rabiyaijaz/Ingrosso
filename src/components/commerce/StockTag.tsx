import { clx } from "@medusajs/ui"
import type { StockView } from "@/lib/commerce"
import { Figure } from "./Figure"

// Three distinct states (PRC-08). "Hidden" and "out" never read alike (R7).
export function StockTag({ view, className }: { view: StockView; className?: string }) {
  if (view.kind === "hidden")
    return <span className={clx("txt-compact-small text-ui-fg-muted", className)}>Stock after approval</span>

  if (view.kind === "out")
    return (
      <span className={clx("inline-flex items-center gap-1.5 txt-compact-small text-ui-tag-red-text", className)}>
        <span aria-hidden className="size-1.5 rounded-full bg-ui-tag-red-icon" />
        Out of stock
      </span>
    )

  return (
    <span className={clx("inline-flex items-center gap-1.5 txt-compact-small text-ui-fg-base", className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-ui-tag-green-icon" />
      <Figure>{view.available.toLocaleString("en")}</Figure> in stock
    </span>
  )
}
