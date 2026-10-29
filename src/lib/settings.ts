import "server-only"
import { cookies } from "next/headers"

// Account settings the buyer can change themselves. Design-review stand-in:
// kept in cookies; production stores them on the customer record.

export type Address = { street: string; postcode: string; city: string; country: string }
export const ADDRESS_COOKIE = "ig_lab_addresses"
export const NOTIFY_COOKIE = "ig_lab_notify"

const SAMPLE_DELIVERY: Address = { street: "Sample street 12", postcode: "3011 AA", city: "Rotterdam", country: "Netherlands" }

export const addressLines = (a: Address) => [a.street, `${a.postcode} ${a.city}`.trim(), a.country].filter(Boolean)

// Billing is null while invoices go to the delivery address
export async function readAddresses(): Promise<{ delivery: Address; billing: Address | null }> {
  try {
    const raw = JSON.parse((await cookies()).get(ADDRESS_COOKIE)?.value ?? "{}")
    return { delivery: raw.delivery ?? SAMPLE_DELIVERY, billing: raw.billing ?? null }
  } catch {
    return { delivery: SAMPLE_DELIVERY, billing: null }
  }
}

export const NOTIFICATIONS = [
  { id: "orders", label: "Order updates", hint: "When an order is picked, shipped and delivered, with the tracking number.", on: true },
  { id: "stock", label: "Back-in-stock alerts", hint: "For parts you asked to hear about.", on: true },
  { id: "prices", label: "Price changes", hint: "When the price of a part you have ordered before goes up or down.", on: false },
  { id: "news", label: "New parts and offers", hint: "At most once a week.", on: false },
] as const
export type NotifyId = (typeof NOTIFICATIONS)[number]["id"]
export const isNotifyId = (v: string): v is NotifyId => NOTIFICATIONS.some((n) => n.id === v)

export async function readNotify(): Promise<Record<NotifyId, boolean>> {
  const defaults = Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, n.on])) as Record<NotifyId, boolean>
  try {
    return { ...defaults, ...JSON.parse((await cookies()).get(NOTIFY_COOKIE)?.value ?? "{}") }
  } catch {
    return defaults
  }
}
