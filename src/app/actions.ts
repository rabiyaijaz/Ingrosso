"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { productBySlug } from "@/lib/catalog"
import { CART_COOKIE, readCart } from "@/lib/cart"
import { VIEW_COOKIE, VIEWER_STATES, type ViewerState } from "@/lib/viewer"

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
