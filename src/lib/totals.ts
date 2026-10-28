import type { Money } from "./catalog"

// Sample shipping rules and VAT for the checkout. Real rules (per country,
// weight and value) come from the client's shipping configuration.

export type CarrierId = "postnl" | "ups" | "collect"

export const FREE_SHIPPING_FROM: Money = 500 * 10000

export const CARRIERS: { id: CarrierId; name: string; detail: string; price: Money; freeAbove?: Money }[] = [
  { id: "postnl", name: "PostNL", detail: "Next working day in the Netherlands. Order before 18:00.", price: 9 * 10000 + 9500, freeAbove: FREE_SHIPPING_FROM },
  { id: "ups", name: "UPS Express", detail: "Next working day across the EU. Order before 17:00.", price: 14 * 10000 + 5000 },
  { id: "collect", name: "Collect from the warehouse", detail: "Ready to collect within two hours.", price: 0 },
]

export type PaymentId = "card" | "paypal" | "invoice"

export const PAYMENTS: { id: PaymentId; name: string; detail: string }[] = [
  { id: "card", name: "Card", detail: "Visa, Mastercard or Maestro on the payment provider's secure page." },
  { id: "paypal", name: "PayPal", detail: "You are sent to PayPal to approve the payment." },
  { id: "invoice", name: "Bank transfer on invoice", detail: "Pay within 14 days of the invoice date." },
]

// Sample account is registered in the Netherlands: domestic VAT at 21%.
export const VAT_RATE = 21

// Integer-only percentage, rounded half-up to whole cents (R3). Money is in
// ten-thousandths, so amount × rate is in hundredths of that unit: one cent
// of tax is 10,000 of them.
const pct = (amount: Money, rate: number) => {
  const scaled = amount * rate + 5000
  return (scaled - (scaled % 10000)) / 100
}

export function orderTotals(subtotal: Money, carrier: CarrierId) {
  const c = CARRIERS.find((x) => x.id === carrier) ?? CARRIERS[0]
  const shipping = c.freeAbove !== undefined && subtotal >= c.freeAbove ? 0 : c.price
  const vat = pct(subtotal + shipping, VAT_RATE)
  return { subtotal, shipping, vat, total: subtotal + shipping + vat }
}
