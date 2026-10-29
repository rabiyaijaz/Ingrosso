"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { GRADES, PRODUCTS, type GradeId } from "@/lib/catalog"
import { ADMIN_COOKIES, DEFAULT_TIERS, getAddedProducts, getCustomers, getOrderChanges, getStockChanges, getTiers } from "@/lib/admin/data"
import type { AdminCategory, Customer, NewProduct, OrderChange, OrderStatus, Tier } from "@/lib/admin/types"
import { CATEGORIES_COOKIE, getCategories } from "@/lib/categories"
import { routes } from "@/lib/routes"

// Trade-desk actions for the prototype: each writes to a cookie (see
// lib/admin/data.ts). Production calls the admin API instead.

const OPTS = { path: "/", sameSite: "lax" as const, maxAge: 60 * 60 * 24 * 30 }

async function patchCustomer(id: string, patch: Partial<Customer>) {
  const store = await cookies()
  const raw = store.get(ADMIN_COOKIES.customers)?.value
  const all: Record<string, Partial<Customer>> = raw ? JSON.parse(raw) : {}
  all[id] = { ...all[id], ...patch }
  store.set(ADMIN_COOKIES.customers, JSON.stringify(all), OPTS)
}

// Approve (with a price tier) or decline an application.
export async function decideApplication(form: FormData) {
  const id = String(form.get("id"))
  const decision = String(form.get("decision"))
  const tiers = await getTiers()
  const tierId = String(form.get("tierId") ?? "")
  if (decision === "approve") await patchCustomer(id, { status: "approved", tierId: tiers.some((t) => t.id === tierId) ? tierId : tiers[0].id })
  else if (decision === "decline") await patchCustomer(id, { status: "rejected", note: String(form.get("note") || "Declined by the trade desk.") })
  revalidatePath("/", "layout")
  redirect(String(form.get("next") || routes.admin.customer(id)))
}

export async function setCustomerAccount(form: FormData) {
  const id = String(form.get("id"))
  const action = String(form.get("action"))
  if (action === "suspend") await patchCustomer(id, { status: "suspended", note: String(form.get("note") || "Suspended by the trade desk.") })
  if (action === "reinstate") await patchCustomer(id, { status: "approved" })
  if (action === "tier") {
    const tierId = String(form.get("tierId"))
    if ((await getTiers()).some((t) => t.id === tierId)) await patchCustomer(id, { tierId })
  }
  revalidatePath("/", "layout")
}

const FLOW: OrderStatus[] = ["new", "picking", "packed", "shipped", "delivered"]

// One order's changes: status, tracking and a short history (kept small, cookies are)
async function patchOrder(ref: string, patch: (o: OrderChange) => OrderChange) {
  const all = await getOrderChanges()
  all[ref] = patch(all[ref] ?? {})
  if (all[ref].history) all[ref].history = all[ref].history!.slice(-8)
  ;(await cookies()).set(ADMIN_COOKIES.orders, JSON.stringify(all), OPTS)
  revalidatePath("/", "layout")
}

export async function setOrderStatus(form: FormData) {
  const ref = String(form.get("ref"))
  const status = String(form.get("status")) as OrderStatus
  if (![...FLOW, "cancelled"].includes(status)) return
  const carrier = String(form.get("carrier") ?? "").trim().slice(0, 24)
  const tracking = String(form.get("tracking") ?? "").trim().slice(0, 40)
  const note = String(form.get("note") ?? "").trim().slice(0, 120)
  await patchOrder(ref, (o) => ({
    ...o,
    status,
    ...(carrier && { carrier }),
    ...(tracking && { tracking }),
    history: [...(o.history ?? []), { at: new Date().toISOString(), status, ...(note && { note }) }],
  }))
}

// Several orders one step on at once (from the orders list)
export async function bulkOrderStatus(form: FormData) {
  const status = String(form.get("status")) as OrderStatus
  if (!FLOW.includes(status)) return
  const refs = form.getAll("ref").map(String).slice(0, 40)
  const all = await getOrderChanges()
  const at = new Date().toISOString()
  for (const ref of refs) all[ref] = { ...all[ref], status, history: [...(all[ref]?.history ?? []), { at, status }].slice(-8) }
  ;(await cookies()).set(ADMIN_COOKIES.orders, JSON.stringify(all), OPTS)
  revalidatePath("/", "layout")
}

export async function addOrderNote(form: FormData) {
  const note = String(form.get("note") ?? "").trim().slice(0, 120)
  if (!note) return
  await patchOrder(String(form.get("ref")), (o) => ({ ...o, history: [...(o.history ?? []), { at: new Date().toISOString(), note }] }))
}

// ─── Price tiers ────────────────────────────────────────────────────────────
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "tier"

export async function saveTier(json: string) {
  const incoming = JSON.parse(json) as Tier
  const tiers = await getTiers()
  const clean: Tier = {
    ...incoming,
    name: incoming.name.trim().slice(0, 40) || "Untitled tier",
    description: incoming.description.trim().slice(0, 140),
    eligibility: incoming.eligibility.trim().slice(0, 80),
    discount: Math.max(0, Math.min(60, Math.round(incoming.discount))),
    breaks: incoming.breaks.filter((b) => b.minQty > 1).map((b) => ({ minQty: Math.round(b.minQty), pct: Math.max(0, Math.min(40, Math.round(b.pct))) })),
    rules: incoming.rules.filter((r) => r.target).map((r) => ({ ...r, pct: Math.max(-30, Math.min(40, Math.round(r.pct))) })),
    minOrder: Math.max(0, Math.round(incoming.minOrder)),
  }
  let id = clean.id
  if (id === "new") {
    id = slugify(clean.name)
    while (tiers.some((t) => t.id === id)) id = `${id}-2`
    tiers.push({ ...clean, id, custom: true })
  } else {
    const i = tiers.findIndex((t) => t.id === id)
    if (i >= 0) tiers[i] = { ...clean, custom: tiers[i].custom }
  }
  ;(await cookies()).set(ADMIN_COOKIES.tiers, JSON.stringify(tiers), OPTS)
  revalidatePath("/", "layout")
  return { ok: true as const, id }
}

export async function deleteTier(form: FormData) {
  const id = String(form.get("id"))
  const tiers = await getTiers()
  const target = tiers.find((t) => t.id === id)
  // The first tier is where new accounts land; tiers in use can't be removed
  const inUse = (await getCustomers()).some((c) => c.tierId === id)
  if (!target || tiers[0].id === id || inUse) return
  ;(await cookies()).set(ADMIN_COOKIES.tiers, JSON.stringify(tiers.filter((t) => t.id !== id)), OPTS)
  revalidatePath("/", "layout")
  redirect(routes.admin.pricing())
}

export async function resetTiers() {
  ;(await cookies()).set(ADMIN_COOKIES.tiers, JSON.stringify(DEFAULT_TIERS), OPTS)
  revalidatePath("/", "layout")
}

// ─── Categories ─────────────────────────────────────────────────────────────
async function writeCategories(list: AdminCategory[]) {
  ;(await cookies()).set(CATEGORIES_COOKIE, JSON.stringify(list), OPTS)
  revalidatePath("/", "layout")
}

// Add (slug "new") or edit a category: names, icon, shown in the store's top bar
export async function saveCategory(form: FormData) {
  const list = await getCategories()
  const slug = String(form.get("slug"))
  const plural = String(form.get("plural") ?? "").trim().slice(0, 32)
  const name = String(form.get("name") ?? "").trim().slice(0, 40) || plural
  const icon = String(form.get("icon") ?? "tools")
  const visible = form.get("visible") === "on"
  if (plural.length < 2) redirect(`${routes.admin.category(slug)}?error=name`)
  let target = slug
  if (slug === "new") {
    target = slugify(plural)
    while (list.some((c) => c.slug === target)) target = `${target}-2`
    list.push({ slug: target, name, plural, icon, visible, custom: true })
  } else {
    const i = list.findIndex((c) => c.slug === slug)
    if (i >= 0) list[i] = { ...list[i], name, plural, icon, visible }
  }
  await writeCategories(list)
  redirect(routes.admin.categories())
}

export async function moveCategory(form: FormData) {
  const list = await getCategories()
  const i = list.findIndex((c) => c.slug === String(form.get("slug")))
  const j = i + (form.get("dir") === "up" ? -1 : 1)
  if (i < 0 || j < 0 || j >= list.length) return
  ;[list[i], list[j]] = [list[j], list[i]]
  await writeCategories(list)
}

export async function toggleCategory(form: FormData) {
  const list = await getCategories()
  const c = list.find((x) => x.slug === String(form.get("slug")))
  if (!c) return
  c.visible = !c.visible
  await writeCategories(list)
}

// Only categories the trade desk added, and only while they hold no parts
export async function deleteCategory(form: FormData) {
  const slug = String(form.get("slug"))
  const list = await getCategories()
  const c = list.find((x) => x.slug === slug)
  const used = PRODUCTS.some((p) => p.category === slug) || (await getAddedProducts()).some((p) => p.category === slug)
  if (!c?.custom || used) return
  await writeCategories(list.filter((x) => x.slug !== slug))
  redirect(routes.admin.categories())
}

// ─── Products ───────────────────────────────────────────────────────────────
// Book stock in (a delivery) or out (a count correction), per part
export async function adjustStock(form: FormData) {
  const slug = String(form.get("slug"))
  const qty = Math.round(Number(form.get("qty")))
  if (!slug || !Number.isFinite(qty) || qty === 0 || Math.abs(qty) > 9999) return
  const all = await getStockChanges()
  all[slug] = (all[slug] ?? 0) + qty
  ;(await cookies()).set(ADMIN_COOKIES.stock, JSON.stringify(all), OPTS)
  revalidatePath("/", "layout")
}

export async function addProduct(json: string) {
  const p = JSON.parse(json) as Omit<NewProduct, "slug">
  const errors: Record<string, string> = {}
  if (p.name.trim().length < 4) errors.name = "Give the part a name of at least 4 characters."
  if (!(await getCategories()).some((c) => c.slug === p.category)) errors.category = "Choose a category."
  if (p.grade && !GRADES.some((g) => g.id === p.grade)) errors.grade = "Choose a grade."
  if (!p.models.length) errors.models = "Choose at least one model the part fits."
  if (!/^[A-Z0-9-]{4,24}$/.test(p.sku)) errors.sku = "Use 4 to 24 capitals, digits or hyphens."
  if (!(p.list > 0)) errors.list = "Enter the list price."
  const added = await getAddedProducts()
  if (!errors.sku && [...PRODUCTS, ...added].some((x) => x.sku === p.sku)) errors.sku = `${p.sku} is already in use. Add a suffix, for example ${p.sku}-B.`
  if (Object.keys(errors).length) return { ok: false as const, errors }

  const slug = `${slugify(p.name)}-${Date.now().toString(36)}`
  const product: NewProduct = { ...p, slug, name: p.name.trim(), grade: (p.grade || null) as GradeId | null }
  ;(await cookies()).set(ADMIN_COOKIES.products, JSON.stringify([product, ...added].slice(0, 8)), OPTS)
  revalidatePath("/", "layout")
  return { ok: true as const, slug }
}
