import type { Money, PriceBreak, Product } from "./catalog"
import type { Viewer } from "./viewer"

// The one place that reads prices or stock (BRD R2). Every price and stock
// figure on screen comes through commercialView().

export type PriceView =
  | { kind: "gated"; reason: "visitor" | "pending" | "suspended" }
  | { kind: "masked" }
  | { kind: "priced"; unit: Money; breaks: PriceBreak[] }

// "hidden" and "out" are different sentences and never render as each other (R7).
export type StockView = { kind: "count"; available: number } | { kind: "hidden" } | { kind: "out" }

export type CommercialView = { price: PriceView; stock: StockView; orderStep: number }

const canSeePrices = (v: Viewer) => v.state === "approved" || v.state === "masked"

// Cheapest applicable price across every list the account is on, at the
// quantity asked for. Ties keep the earlier (higher priority) list.
function unitAt(product: Product, lists: string[], qty: number): Money | null {
  let best: Money | null = null
  for (const id of lists) {
    const ladder = product.commercial.lists[id]
    if (!ladder) continue
    const step = [...ladder].reverse().find((b) => qty >= b.minQty)
    if (step && (best === null || step.unit < best)) best = step.unit
  }
  return best
}

// The ladder shown equals the price charged at each break (PRC-05).
function mergedBreaks(product: Product, lists: string[]): PriceBreak[] {
  const qtys = new Set<number>()
  for (const id of lists) product.commercial.lists[id]?.forEach((b) => qtys.add(b.minQty))
  return [...qtys]
    .sort((a, b) => a - b)
    .map((minQty) => ({ minQty, unit: unitAt(product, lists, minQty)! }))
    .filter((b) => b.unit !== null)
}

export function commercialView(product: Product, viewer: Viewer): CommercialView {
  const orderStep = product.orderStep
  if (!canSeePrices(viewer)) {
    const reason = viewer.state === "pending" ? "pending" : viewer.state === "suspended" ? "suspended" : "visitor"
    return { price: { kind: "gated", reason }, stock: { kind: "hidden" }, orderStep }
  }
  const available = product.commercial.onHand - product.commercial.reserved
  const stock: StockView = available > 0 ? { kind: "count", available } : { kind: "out" }
  if (viewer.state === "masked") return { price: { kind: "masked" }, stock, orderStep }
  const breaks = mergedBreaks(product, viewer.priceLists)
  return { price: { kind: "priced", unit: breaks[0]?.unit ?? 0, breaks }, stock, orderStep }
}

// Admin only: the list price (single-unit standard trade price) and stock on
// hand, which price tiers are calculated from and the stock screens report.
export const listPrice = (product: Product): Money => product.commercial.lists["trade-standard"]?.[0]?.unit ?? 0
export const stockOf = (product: Product) => ({
  onHand: product.commercial.onHand,
  available: Math.max(0, product.commercial.onHand - product.commercial.reserved),
})

export function unitPriceAt(product: Product, viewer: Viewer, qty: number): Money | null {
  if (viewer.state !== "approved") return null
  return unitAt(product, viewer.priceLists, qty)
}
