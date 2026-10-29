import { CATEGORIES, GRADES, PRODUCTS, productBySlug, type Money } from "../catalog"
import { stockOf } from "../commerce"
import type { AdminOrder, Customer } from "./types"

// Dashboard figures, all from the order and customer lists. Money stays
// integer until it is formatted.

const DAY = 86400000
const startOfDay = (t: number) => {
  const d = new Date(t)
  d.setUTCHours(0, 0, 0, 0)
  return d.getTime()
}

const live = (o: AdminOrder) => o.status !== "cancelled"

export function niceMax(v: number) {
  if (v <= 0) return 1
  const p = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / p
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p
}

// €12.4k style for chart scales; whole euros otherwise
export function euroShort(m: Money) {
  const e = m / 10000
  if (e >= 1000) return `€${(e / 1000).toFixed(e >= 10000 ? 0 : 1)}k`
  return `€${Math.round(e)}`
}
export const euroWhole = (m: Money) => `€${Math.round(m / 10000).toLocaleString("en")}`

export function dashboardStats(orders: AdminOrder[], customers: Customer[]) {
  const today = startOfDay(Date.now())
  const inRange = (o: AdminOrder, fromDays: number, toDays: number) => {
    const t = new Date(o.placedAt).getTime()
    return t >= today - fromDays * DAY && t < today - toDays * DAY + DAY
  }
  const sum = (list: AdminOrder[]) => list.reduce((t, o) => t + o.total, 0)

  const last7 = orders.filter((o) => live(o) && inRange(o, 6, 0))
  const prev7 = orders.filter((o) => live(o) && inRange(o, 13, 7))
  const revenue = sum(last7), revenuePrev = sum(prev7)
  const aov = last7.length ? Math.round(revenue / last7.length) : 0
  const aovPrev = prev7.length ? Math.round(revenuePrev / prev7.length) : 0
  const delta = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : 0)

  const days = Array.from({ length: 30 }, (_, i) => {
    const start = today - (29 - i) * DAY
    const list = orders.filter((o) => live(o) && new Date(o.placedAt).getTime() >= start && new Date(o.placedAt).getTime() < start + DAY)
    const d = new Date(start)
    return {
      start,
      value: sum(list),
      orders: list.length,
      weekend: d.getUTCDay() === 0 || d.getUTCDay() === 6,
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
      long: d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }),
    }
  })

  const pending = customers.filter((c) => c.status === "pending").sort((a, b) => a.appliedAt.localeCompare(b.appliedAt))
  const toPick = orders.filter((o) => o.status === "new" || o.status === "picking")
  const overdue = orders.filter((o) => o.payment === "overdue" && live(o))

  // Parts selling in the last 30 days that are low or out
  const sold30 = new Map<string, number>()
  orders.filter((o) => live(o) && inRange(o, 29, 0)).forEach((o) => o.lines.forEach((l) => sold30.set(l.slug, (sold30.get(l.slug) ?? 0) + l.qty)))
  const lowStock = PRODUCTS.map((p) => ({ product: p, ...stockOf(p), sold: sold30.get(p.slug) ?? 0 }))
    .filter((r) => r.sold > 0 && r.available <= 12)
    .sort((a, b) => a.available - b.available || b.sold - a.sold)

  // Revenue by category and by grade family, 30 days
  const byCat = new Map<string, number>()
  const byFam = new Map<string, number>()
  orders.filter((o) => live(o) && inRange(o, 29, 0)).forEach((o) =>
    o.lines.forEach((l) => {
      const p = productBySlug(l.slug)
      if (!p) return
      byCat.set(p.category, (byCat.get(p.category) ?? 0) + l.unit * l.qty)
      const fam = GRADES.find((g) => g.id === p.grade)?.family ?? "Ungraded"
      byFam.set(fam, (byFam.get(fam) ?? 0) + l.unit * l.qty)
    })
  )
  const categories = CATEGORIES.map((c) => ({ slug: c.slug, label: c.plural, value: byCat.get(c.slug) ?? 0 })).sort((a, b) => b.value - a.value)
  const famTotal = [...byFam.values()].reduce((a, b) => a + b, 0) || 1
  const families = (["Genuine", "Aftermarket", "Third-party"] as const).map((f) => ({ family: f, share: Math.round(((byFam.get(f) ?? 0) / famTotal) * 100), value: byFam.get(f) ?? 0 }))

  // Top customers, 30 days
  const byCustomer = new Map<string, { value: number; orders: number }>()
  orders.filter((o) => live(o) && inRange(o, 29, 0)).forEach((o) => {
    const c = byCustomer.get(o.customerId) ?? { value: 0, orders: 0 }
    byCustomer.set(o.customerId, { value: c.value + o.total, orders: c.orders + 1 })
  })
  const topCustomers = [...byCustomer.entries()]
    .map(([id, v]) => ({ customer: customers.find((c) => c.id === id)!, ...v }))
    .filter((r) => r.customer)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  return {
    revenue: { value: revenue, delta: delta(revenue, revenuePrev), spark: days.slice(-14).map((d) => d.value) },
    orders: { value: last7.length, delta: delta(last7.length, prev7.length), spark: days.slice(-14).map((d) => d.orders) },
    aov: { value: aov, delta: delta(aov, aovPrev) },
    pending,
    toPick,
    overdue: { count: overdue.length, value: sum(overdue) },
    lowStock,
    days,
    month: { value: sum(orders.filter((o) => live(o) && inRange(o, 29, 0))), orders: orders.filter((o) => live(o) && inRange(o, 29, 0)).length },
    categories,
    families,
    topCustomers,
    activeAccounts: customers.filter((c) => c.status === "approved").length,
  }
}
