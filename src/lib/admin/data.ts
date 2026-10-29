import "server-only"
import { cookies } from "next/headers"
import { PRODUCTS, type Product } from "../catalog"
import { listPrice } from "../commerce"
import { LAB } from "../lab"
import { readOrders } from "../orders"
import { tierUnit } from "./pricing"
import type { AdminOrder, Customer, NewProduct, OrderChange, OrderStatus, PaymentState, Tier } from "./types"

export * from "./types"

// Sample admin data for design review, plus the trade desk's changes kept in
// cookies so approvals, order steps, tiers and new products stick while the
// prototype is clicked through. Production reads and writes the database.

const PREFIX = LAB ? "ig_lab_admin_" : "ig_admin_"
export const ADMIN_COOKIES = {
  customers: `${PREFIX}customers`,
  orders: `${PREFIX}orders`,
  tiers: `${PREFIX}tiers`,
  products: `${PREFIX}products`,
  stock: `${PREFIX}stock`,
} as const

// ─── Price tiers ────────────────────────────────────────────────────────────
export const DEFAULT_TIERS: Tier[] = [
  {
    id: "trade",
    name: "Trade",
    description: "The standard list for every approved repair shop.",
    discount: 0,
    breaks: [{ minQty: 5, pct: 3 }, { minQty: 10, pct: 6 }, { minQty: 25, pct: 10 }],
    rules: [],
    minOrder: 0,
    terms: "prepay",
    eligibility: "Every approved account starts here",
  },
  {
    id: "trade-plus",
    name: "Trade Plus",
    description: "Regular shops that order every week.",
    discount: 4,
    breaks: [{ minQty: 5, pct: 3 }, { minQty: 10, pct: 6 }, { minQty: 25, pct: 10 }],
    rules: [{ id: "r1", scope: "category", target: "batteries", pct: 2 }],
    minOrder: 0,
    terms: "net14",
    eligibility: "Over €2,500 spent in the last 90 days",
  },
  {
    id: "volume",
    name: "Volume Partner",
    description: "Multi-site repair chains buying in bulk.",
    discount: 8,
    breaks: [{ minQty: 10, pct: 4 }, { minQty: 25, pct: 8 }, { minQty: 50, pct: 12 }],
    rules: [
      { id: "r1", scope: "category", target: "screens", pct: 2 },
      { id: "r2", scope: "family", target: "Third-party", pct: 3 },
    ],
    minOrder: 2500000,
    terms: "net30",
    eligibility: "Over €10,000 spent in the last 90 days",
  },
  {
    id: "distributor",
    name: "Distributor",
    description: "Resellers buying stock to sell on, by agreement.",
    discount: 14,
    breaks: [{ minQty: 50, pct: 4 }, { minQty: 100, pct: 8 }],
    rules: [{ id: "r1", scope: "family", target: "Genuine", pct: -4 }],
    minOrder: 10000000,
    terms: "net30",
    eligibility: "Signed reseller agreement",
  },
]

// Parts across categories and grades used to compare tiers
export const SAMPLE_PARTS = [
  "iphone-16-pro-screen-service-pack",
  "iphone-16-pro-screen-soft-oled",
  "iphone-16-pro-screen-in-cell",
  "galaxy-s25-ultra-battery-oem",
  "pixel-9-pro-rear-camera-pulled",
]

// ─── Customers ──────────────────────────────────────────────────────────────
const daysAgo = (d: number, h = 10) => {
  const t = new Date()
  t.setUTCHours(h, 0, 0, 0)
  t.setUTCDate(t.getUTCDate() - d)
  return t.toISOString()
}

const SAMPLE_CUSTOMERS: Customer[] = [
  { id: "c01", company: "Fix Point Repairs B.V.", contact: "Sanne de Vries", email: "inkoop@fixpoint.example", city: "Rotterdam", country: "NL", vatId: "NL859312447B01", vatChecked: true, type: "Repair shop", appliedAt: daysAgo(210), status: "approved", tierId: "trade" },
  { id: "c02", company: "Phone Doctor Utrecht", contact: "Youssef Amrani", email: "orders@phonedoctor.example", city: "Utrecht", country: "NL", vatId: "NL004495445B01", vatChecked: true, type: "Repair shop", appliedAt: daysAgo(340), status: "approved", tierId: "trade-plus" },
  { id: "c03", company: "ReCell Benelux", contact: "Pieter Janssens", email: "purchasing@recell.example", city: "Antwerp", country: "BE", vatId: "BE0417497106", vatChecked: true, type: "Refurbisher", appliedAt: daysAgo(400), status: "approved", tierId: "volume" },
  { id: "c04", company: "Handy Klinik Köln", contact: "Lena Schmidt", email: "einkauf@handyklinik.example", city: "Cologne", country: "DE", vatId: "DE811569869", vatChecked: true, type: "Repair shop", appliedAt: daysAgo(150), status: "approved", tierId: "trade" },
  { id: "c05", company: "GSM Partners Nordic", contact: "Anders Holm", email: "trade@gsmpartners.example", city: "Copenhagen", country: "DK", vatId: "DK13585628", vatChecked: true, type: "Reseller", appliedAt: daysAgo(500), status: "approved", tierId: "distributor" },
  { id: "c06", company: "iRepair Den Haag", contact: "Mila Bakker", email: "shop@irepairdh.example", city: "The Hague", country: "NL", vatId: "NL812345678B01", vatChecked: true, type: "Repair shop", appliedAt: daysAgo(90), status: "approved", tierId: "trade-plus" },
  { id: "c07", company: "TechFix Lyon", contact: "Camille Martin", email: "achats@techfix.example", city: "Lyon", country: "FR", vatId: "FR40303265045", vatChecked: true, type: "Repair shop", appliedAt: daysAgo(60), status: "approved", tierId: "trade" },
  { id: "c08", company: "Mobile Care Amsterdam", contact: "Daan Visser", email: "info@mobilecare.example", city: "Amsterdam", country: "NL", vatId: "NL001234567B02", vatChecked: true, type: "Repair shop", appliedAt: daysAgo(30), status: "suspended", tierId: "trade", note: "VAT registration could not be confirmed on renewal." },
  { id: "c09", company: "SmartRepair Eindhoven", contact: "Noah Willems", email: "inkoop@smartrepair.example", city: "Eindhoven", country: "NL", vatId: "NL862095178B01", vatChecked: true, type: "Repair shop", appliedAt: daysAgo(0, 8), status: "pending", tierId: null },
  { id: "c10", company: "Refurb Hub GmbH", contact: "Jonas Weber", email: "trade@refurbhub.example", city: "Düsseldorf", country: "DE", vatId: "DE297644215", vatChecked: true, type: "Refurbisher", appliedAt: daysAgo(1, 15), status: "pending", tierId: null },
  { id: "c11", company: "Fone Fix Gent", contact: "Lotte Peeters", email: "lotte@fonefix.example", city: "Ghent", country: "BE", vatId: "BE0999999999", vatChecked: false, type: "Repair shop", appliedAt: daysAgo(2, 11), status: "pending", tierId: null, note: "Tax number not found in VIES. Ask for a registration extract." },
  { id: "c12", company: "Campus IT Services", contact: "Ravi Kapoor", email: "procurement@campusit.example", city: "Delft", country: "NL", vatId: "NL850746213B01", vatChecked: true, type: "Corporate IT", appliedAt: daysAgo(3, 9), status: "pending", tierId: null },
  { id: "c13", company: "Cellular Express", contact: "Omar Haddad", email: "omar@cellexpress.example", city: "Brussels", country: "BE", vatId: "BE0628711547", vatChecked: true, type: "Reseller", appliedAt: daysAgo(12), status: "rejected", tierId: null, note: "Consumer reseller outside the trade terms." },
]

// ─── Orders (generated, stable for the day) ─────────────────────────────────
function seed(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619)
  return h >>> 0
}

const BUYERS = ["c01", "c02", "c03", "c04", "c05", "c06", "c07", "c02", "c03", "c06"]

function sampleOrders(tiers: Tier[]): AdminOrder[] {
  const out: AdminOrder[] = []
  let n = 5012
  for (let d = 29; d >= 0; d--) {
    const day = new Date(daysAgo(d))
    const weekend = day.getUTCDay() === 0 || day.getUTCDay() === 6
    const count = weekend ? seed(`w${d}`) % 2 : 3 + (seed(`d${d}`) % 5)
    for (let i = 0; i < count; i++) {
      const s = seed(`${d}-${i}`)
      const customerId = BUYERS[s % BUYERS.length]
      const tier = tiers.find((t) => t.id === SAMPLE_CUSTOMERS.find((c) => c.id === customerId)?.tierId) ?? tiers[0]
      const lines = Array.from({ length: 1 + (s % 6) }, (_, k) => {
        const p = PRODUCTS[seed(`${s}-${k}`) % PRODUCTS.length]
        const qty = [1, 2, 3, 5, 5, 10, 10, 25][seed(`q${s}${k}`) % 8] * (tier.id === "distributor" ? 4 : 1)
        return { slug: p.slug, qty, unit: tierUnit(tier, listPrice(p), p.category, p.grade, qty) }
      })
      const total = lines.reduce((t, l) => t + l.unit * l.qty, 0)
      const status: OrderStatus =
        s % 41 === 0 ? "cancelled" : d === 0 ? (i % 3 === 0 ? "picking" : "new") : d === 1 ? (i % 2 ? "packed" : "shipped") : d < 4 ? "shipped" : "delivered"
      const net = tier.terms !== "prepay"
      const payment: PaymentState = !net ? "paid" : d > (tier.terms === "net14" ? 14 : 30) - 2 && s % 3 === 0 ? "overdue" : d > 6 && s % 2 ? "paid" : "invoiced"
      out.push({ ref: `IG-2026-00${n++}`, customerId, placedAt: daysAgo(d, 8 + (s % 9)), lines, total, status, payment })
    }
  }
  return out.reverse()
}

// ─── Reading, with the trade desk's changes applied ─────────────────────────
async function readJson<T>(name: string, fallback: T): Promise<T> {
  const raw = (await cookies()).get(name)?.value
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export async function getTiers(): Promise<Tier[]> {
  return readJson(ADMIN_COOKIES.tiers, DEFAULT_TIERS)
}

export async function getCustomers(): Promise<Customer[]> {
  const changes = await readJson<Record<string, Partial<Customer>>>(ADMIN_COOKIES.customers, {})
  return SAMPLE_CUSTOMERS.map((c) => ({ ...c, ...changes[c.id] }))
}

export async function getOrders(): Promise<AdminOrder[]> {
  const [tiers, statuses, placed] = await Promise.all([
    getTiers(),
    getOrderChanges(),
    readOrders(),
  ])
  // Orders placed in the storefront prototype show up as new orders from the sample shop
  const fromStore: AdminOrder[] = placed.map((o) => ({
    ref: o.ref,
    customerId: "c01",
    placedAt: o.placedAt,
    lines: o.lines,
    total: o.subtotal,
    status: "new",
    payment: o.payment === "invoice" ? "invoiced" : "paid",
  }))
  return [...fromStore, ...sampleOrders(tiers)].map((o) => ({ ...o, ...statuses[o.ref], status: statuses[o.ref]?.status ?? o.status }))
}

// Per order: its status, tracking and history. Older cookies kept the status alone.
export async function getOrderChanges(): Promise<Record<string, OrderChange>> {
  const raw = await readJson<Record<string, OrderStatus | OrderChange>>(ADMIN_COOKIES.orders, {})
  return Object.fromEntries(Object.entries(raw).map(([ref, v]) => [ref, typeof v === "string" ? { status: v } : v]))
}

export async function getAddedProducts(): Promise<NewProduct[]> {
  return readJson(ADMIN_COOKIES.products, [])
}

// Every product the admin manages: the catalogue plus parts added here
// Stock the desk booked in (received deliveries, counts), per product slug
export async function getStockChanges(): Promise<Record<string, number>> {
  return readJson(ADMIN_COOKIES.stock, {})
}

export async function getAdminProducts(): Promise<(Product & { added?: boolean })[]> {
  const [added, booked] = await Promise.all([getAddedProducts(), getStockChanges()])
  const withStock = (p: Product): Product => (booked[p.slug] ? { ...p, commercial: { ...p.commercial, onHand: p.commercial.onHand + booked[p.slug] } } : p)
  return [
    ...added.map((a) => ({
      slug: a.slug,
      sku: a.sku,
      name: a.name,
      category: a.category,
      grade: a.grade,
      models: a.models,
      specs: [],
      orderStep: a.orderStep,
      commercial: { lists: { "trade-standard": [{ minQty: 1, unit: a.list }] }, onHand: a.onHand, reserved: 0 },
      added: true,
    })),
    ...PRODUCTS,
  ].map(withStock)
}
