"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { productBySlug } from "@/lib/catalog"
import { CART_COOKIE, readCart } from "@/lib/cart"
import { unitPriceAt } from "@/lib/commerce"
import { ORDERS_COOKIE, readOrders, type PlacedOrder } from "@/lib/orders"
import { orderTotals, type CarrierId, type PaymentId } from "@/lib/totals"
import { VIEW_COOKIE, VIEWER_STATES, getViewer, type ViewerState } from "@/lib/viewer"

const COOKIE_OPTS = { path: "/", sameSite: "lax" as const, maxAge: 60 * 60 * 24 * 30 }

// Design-review only: switches which account state the storefront renders for.
export async function setViewerState(state: ViewerState) {
  if (!VIEWER_STATES.some((s) => s.id === state)) return
  ;(await cookies()).set(VIEW_COOKIE, state, COOKIE_OPTS)
  revalidatePath("/", "layout")
}

export async function setCartLine(slug: string, qty: number, mode: "add" | "set" = "add") {
  const product = productBySlug(slug)
  if (!product || !Number.isInteger(qty)) return { ok: false as const }
  const lines = await readCart()
  const existing = lines.find((l) => l.slug === slug)
  const next = mode === "add" ? (existing?.qty ?? 0) + qty : qty
  // Round up to the product's order step (e.g. screws in multiples of 50).
  const stepped = next <= 0 ? 0 : Math.ceil(next / product.orderStep) * product.orderStep
  const updated = existing
    ? lines.map((l) => (l.slug === slug ? { ...l, qty: stepped } : l)).filter((l) => l.qty > 0)
    : stepped > 0
      ? [...lines, { slug, qty: stepped }]
      : lines
  ;(await cookies()).set(CART_COOKIE, JSON.stringify(updated), COOKIE_OPTS)
  revalidatePath("/", "layout")
  return { ok: true as const, qty: stepped, lines: updated.length }
}

export async function submitApplication() {
  ;(await cookies()).set(VIEW_COOKIE, "pending", COOKIE_OPTS)
  revalidatePath("/", "layout")
}

export async function signOut() {
  ;(await cookies()).set(VIEW_COOKIE, "visitor", COOKIE_OPTS)
  revalidatePath("/", "layout")
}

// Places the current order. Prices are re-resolved here from the price gate,
// never taken from the browser (R2).
export async function placeOrder(input: { carrier: CarrierId; payment: PaymentId; reference: string }) {
  const viewer = await getViewer()
  if (viewer.state !== "approved" && viewer.state !== "masked") return { ok: false as const, error: "Your account cannot order right now." }
  const lines = await readCart()
  if (!lines.length) return { ok: false as const, error: "Your order is empty." }

  const priced = lines.map((l) => {
    const product = productBySlug(l.slug)!
    const unit = unitPriceAt(product, { ...viewer, state: "approved" }, l.qty) ?? 0
    return { slug: l.slug, qty: l.qty, unit }
  })
  const subtotal = priced.reduce((s, l) => s + l.unit * l.qty, 0)
  const totals = orderTotals(subtotal, input.carrier)
  const now = new Date()
  const order: PlacedOrder = {
    ref: `IG-${now.getFullYear()}-${String(now.getTime()).slice(-6)}`,
    placedAt: now.toISOString(),
    lines: priced,
    ...totals,
    carrier: input.carrier,
    payment: input.payment,
    reference: input.reference.slice(0, 40),
  }

  const store = await cookies()
  const previous = await readOrders()
  store.set(ORDERS_COOKIE, JSON.stringify([order, ...previous].slice(0, 5)), COOKIE_OPTS)
  store.set(CART_COOKIE, "[]", COOKIE_OPTS)
  revalidatePath("/", "layout")
  return { ok: true as const, ref: order.ref }
}

// Lab only: back to a signed-out visitor with an empty order and no history.
export async function resetPrototype() {
  const store = await cookies()
  store.set(VIEW_COOKIE, "visitor", COOKIE_OPTS)
  store.set(CART_COOKIE, "[]", COOKIE_OPTS)
  store.set(ORDERS_COOKIE, "[]", COOKIE_OPTS)
  revalidatePath("/", "layout")
}
