"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { productBySlug } from "@/lib/catalog"
import { CART_COOKIE, readCart } from "@/lib/cart"
import { stockOf, unitPriceAt } from "@/lib/commerce"
import { WATCH_COOKIE, readWatchList } from "@/lib/watch"
import { LAB } from "@/lib/lab"
import { THEME_COOKIE, isTheme, type ThemeId } from "@/lib/themes"
import { LANG_COOKIE, MODE_COOKIE, isLang, isMode, type LangCode, type Mode } from "@/lib/prefs"
import { ADDRESS_COOKIE, NOTIFY_COOKIE, isNotifyId, readAddresses, readNotify, type Address } from "@/lib/settings"
import { ICON_STYLE_COOKIE, isIconStyle, type IconStyle } from "@/lib/icon-styles"
import { LISTING_COOKIE, isListing, type ListingVariant } from "@/lib/listing-variants"
import { ORDERS_COOKIE, readOrders, type PlacedOrder } from "@/lib/orders"
import { orderTotals, type CarrierId, type PaymentId } from "@/lib/totals"
import { VIEW_COOKIE, VIEWER_STATES, getViewer, type ViewerState } from "@/lib/viewer"

const COOKIE_OPTS = { path: "/", sameSite: "lax" as const, maxAge: 60 * 60 * 24 * 30 }
const PREF_OPTS = { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 365 }

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

// Buy again: an earlier order's lines go back into the current order, on top
// of what is there, rounded to each part's order step. Parts out of stock are
// left out and counted, so the buyer is told.
export async function reorder(ref: string) {
  const viewer = await getViewer()
  if (viewer.state !== "approved" && viewer.state !== "masked") return { ok: false as const, error: "Your account cannot order right now." }
  const order = (await readOrders()).find((o) => o.ref === ref)
  if (!order) return { ok: false as const, error: "That order was not found." }
  const lines = await readCart()
  let added = 0
  let skipped = 0
  for (const l of order.lines) {
    const product = productBySlug(l.slug)
    if (!product || stockOf(product).available === 0) { skipped++; continue }
    const existing = lines.find((x) => x.slug === l.slug)
    const qty = Math.ceil(((existing?.qty ?? 0) + l.qty) / product.orderStep) * product.orderStep
    if (existing) existing.qty = qty
    else lines.push({ slug: l.slug, qty })
    added++
  }
  ;(await cookies()).set(CART_COOKIE, JSON.stringify(lines), COOKIE_OPTS)
  revalidatePath("/", "layout")
  return { ok: true as const, added, skipped }
}

// "Email me when it's back": a watch list of out-of-stock parts (prototype:
// kept in a cookie; production subscribes the account's email)
export async function toggleStockWatch(slug: string) {
  if (!productBySlug(slug)) return { ok: false as const }
  const store = await cookies()
  const list = await readWatchList()
  const on = !list.includes(slug)
  const next = on ? [...list, slug].slice(-30) : list.filter((s) => s !== slug)
  store.set(WATCH_COOKIE, JSON.stringify(next), COOKIE_OPTS)
  revalidatePath("/", "layout")
  return { ok: true as const, on }
}

// Places the current order. Prices are re-resolved here from the price gate,
// never taken from the browser (R2).
export async function placeOrder(input: { carrier: CarrierId; payment: PaymentId; reference: string; note?: string }) {
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
    note: input.note?.trim().slice(0, 200) || undefined,
  }

  const store = await cookies()
  const previous = await readOrders()
  store.set(ORDERS_COOKIE, JSON.stringify([order, ...previous].slice(0, 5)), COOKIE_OPTS)
  store.set(CART_COOKIE, "[]", COOKIE_OPTS)
  revalidatePath("/", "layout")
  return { ok: true as const, ref: order.ref }
}

// Preferences: Light or Dark, and language. Picking a mode also drops any
// theme the lab toolbar was previewing, so the choice shows.
export async function setMode(mode: Mode) {
  if (!isMode(mode)) return
  const store = await cookies()
  store.set(MODE_COOKIE, mode, PREF_OPTS)
  store.delete(THEME_COOKIE)
  revalidatePath("/", "layout")
}

export async function setLanguage(lang: LangCode) {
  if (!isLang(lang)) return
  ;(await cookies()).set(LANG_COOKIE, lang, PREF_OPTS)
  revalidatePath("/", "layout")
}

// Account settings ---------------------------------------------------------

export async function saveAddress(kind: "delivery" | "billing", address: Address | null) {
  const clean = (s: unknown) => String(s ?? "").trim().slice(0, 120)
  if (address && (!clean(address.street) || !clean(address.city) || !clean(address.country)))
    return { ok: false as const, error: "Street, city and country are needed." }
  const current = await readAddresses()
  const next = { ...current, [kind]: address && { street: clean(address.street), postcode: clean(address.postcode), city: clean(address.city), country: clean(address.country) } }
  ;(await cookies()).set(ADDRESS_COOKIE, JSON.stringify(next), COOKIE_OPTS)
  revalidatePath("/", "layout")
  return { ok: true as const }
}

export async function setNotify(id: string, on: boolean) {
  if (!isNotifyId(id)) return
  const current = await readNotify()
  ;(await cookies()).set(NOTIFY_COOKIE, JSON.stringify({ ...current, [id]: on }), COOKIE_OPTS)
  revalidatePath("/", "layout")
}

// Company details were checked when the account was approved, so a change is
// a request the trade desk reviews. Prototype: nothing is stored.
export async function requestCompanyChange(formData: FormData) {
  const text = String(formData.get("change") ?? "").trim()
  if (!text) return
}

// Prototype: the password form checks the rules only
export async function changePassword(formData: FormData) {
  const next = String(formData.get("new") ?? "")
  if (next.length < 10 || next !== String(formData.get("confirm") ?? "")) return
}

// Lab only: preview a colour theme across the whole site.
export async function setLabTheme(theme: ThemeId) {
  if (!LAB || !isTheme(theme)) return
  ;(await cookies()).set(THEME_COOKIE, theme, COOKIE_OPTS)
  revalidatePath("/", "layout")
}

// Lab only: preview a listing layout on every part list.
export async function setLabListing(variant: ListingVariant) {
  if (!LAB || !isListing(variant)) return
  ;(await cookies()).set(LISTING_COOKIE, variant, COOKIE_OPTS)
  revalidatePath("/", "layout")
}

// Lab only: preview simple glass icons or the 3D renders at small sizes.
export async function setLabIcons(style: IconStyle) {
  if (!LAB || !isIconStyle(style)) return
  ;(await cookies()).set(ICON_STYLE_COOKIE, style, COOKIE_OPTS)
  revalidatePath("/", "layout")
}

// Lab only: back to a signed-out visitor with an empty order and no history.
export async function resetPrototype() {
  const store = await cookies()
  store.set(VIEW_COOKIE, "visitor", COOKIE_OPTS)
  store.set(CART_COOKIE, "[]", COOKIE_OPTS)
  store.set(ORDERS_COOKIE, "[]", COOKIE_OPTS)
  store.set(WATCH_COOKIE, "[]", COOKIE_OPTS)
  store.delete(ADDRESS_COOKIE)
  store.delete(NOTIFY_COOKIE)
  revalidatePath("/", "layout")
}
