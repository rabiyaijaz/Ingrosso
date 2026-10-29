import type { GradeId, Money } from "../catalog"

// Admin shapes. Client-safe (no data, no cookies).

export type CustomerStatus = "pending" | "approved" | "rejected" | "suspended"
export type BusinessType = "Repair shop" | "Reseller" | "Refurbisher" | "Corporate IT"

export type Customer = {
  id: string
  company: string
  contact: string
  email: string
  city: string
  country: string
  vatId: string
  vatChecked: boolean // VIES check result on the tax number
  type: BusinessType
  appliedAt: string // ISO
  status: CustomerStatus
  tierId: string | null
  note?: string
}

export type OrderStatus = "new" | "picking" | "packed" | "shipped" | "delivered" | "cancelled"
export type PaymentState = "paid" | "invoiced" | "overdue"

export type AdminOrder = {
  ref: string
  customerId: string
  placedAt: string // ISO
  lines: { slug: string; qty: number; unit: Money }[]
  total: Money // before VAT
  status: OrderStatus
  payment: PaymentState
}

// A price tier is a named set of rules applied to the list price.
//   discount     off the list price, everywhere
//   breaks       extra off at a quantity, on top of the discount
//   rules        the customisable part: extra off (or on) for a category,
//                a grade family or one grade, most specific wins
export type TierRule = { id: string; scope: "category" | "family" | "grade"; target: string; pct: number }
export type Tier = {
  id: string
  name: string
  description: string
  discount: number
  breaks: { minQty: number; pct: number }[]
  rules: TierRule[]
  minOrder: Money
  terms: "prepay" | "net14" | "net30"
  eligibility: string
  custom?: boolean // created by the trade desk, not one of the starting four
}

export const TERMS = { prepay: "Card or bank transfer, paid before dispatch", net14: "Invoice, 14 days", net30: "Invoice, 30 days" } as const
export const TERMS_SHORT = { prepay: "Pay before dispatch", net14: "Net 14", net30: "Net 30" } as const

export const ORDER_STATUS: Record<OrderStatus, { label: string; color: "orange" | "blue" | "purple" | "green" | "grey" | "red" }> = {
  new: { label: "New", color: "orange" },
  picking: { label: "Picking", color: "blue" },
  packed: { label: "Packed", color: "purple" },
  shipped: { label: "Shipped", color: "green" },
  delivered: { label: "Delivered", color: "grey" },
  cancelled: { label: "Cancelled", color: "red" },
}
export const PAYMENT_STATE: Record<PaymentState, { label: string; color: "green" | "blue" | "red" }> = {
  paid: { label: "Paid", color: "green" },
  invoiced: { label: "Invoiced", color: "blue" },
  overdue: { label: "Overdue", color: "red" },
}
export const CUSTOMER_STATUS: Record<CustomerStatus, { label: string; color: "orange" | "green" | "red" | "grey" }> = {
  pending: { label: "Awaiting review", color: "orange" },
  approved: { label: "Approved", color: "green" },
  rejected: { label: "Declined", color: "grey" },
  suspended: { label: "Suspended", color: "red" },
}

// A part category as the trade desk manages it. `icon` picks one of the glass
// part glyphs; `visible` puts it in the store's top bar.
export type AdminCategory = {
  slug: string
  name: string // one item, e.g. "Screen assembly"
  plural: string // the category, e.g. "Screens"
  icon: string
  visible: boolean
  custom?: boolean // added by the trade desk
}

export type NewProduct = {
  slug: string
  sku: string
  name: string
  category: string
  grade: GradeId | null
  models: string[]
  list: Money
  onHand: number
  orderStep: number
}
