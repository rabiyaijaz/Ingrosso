import "server-only"
import { cookies } from "next/headers"
import type { Money } from "./catalog"
import { LAB } from "./lab"
import type { CarrierId, PaymentId } from "./totals"

// Placed orders for the prototype, kept in a cookie. Production reads them
// from the order history API.

export const ORDERS_COOKIE = LAB ? "ig_lab_orders" : "ig_orders"

export type PlacedOrder = {
  ref: string
  placedAt: string
  lines: { slug: string; qty: number; unit: Money }[]
  subtotal: Money
  shipping: Money
  vat: Money
  total: Money
  carrier: CarrierId
  payment: PaymentId
  reference: string
  note?: string // for the warehouse
}

export async function readOrders(): Promise<PlacedOrder[]> {
  const raw = (await cookies()).get(ORDERS_COOKIE)?.value
  if (!raw) return []
  try {
    return JSON.parse(raw) as PlacedOrder[]
  } catch {
    return []
  }
}

export async function findOrder(ref: string) {
  return (await readOrders()).find((o) => o.ref === ref)
}
