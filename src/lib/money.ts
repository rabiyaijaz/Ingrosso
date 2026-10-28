import type { Money } from "./catalog"

// Formats integer ten-thousandths of a euro without floating point (R3).
// Two decimals when the amount is whole cents, four when it is not (€0.0450).
export function formatMoney(amount: Money, opts: { fixed4?: boolean } = {}) {
  const negative = amount < 0
  const abs = Math.abs(amount)
  const euros = (abs - (abs % 10000)) / 10000
  const frac = abs % 10000
  const four = opts.fixed4 || frac % 100 !== 0
  const fracStr = four ? String(frac).padStart(4, "0") : String((frac - (frac % 100)) / 100).padStart(2, "0")
  const eurosStr = String(euros).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return `${negative ? "−" : ""}€${eurosStr}.${fracStr}`
}

export const multiply = (unit: Money, qty: number): Money => unit * qty
