import type { GradeId, Money } from "../catalog"
import type { Tier } from "./types"

// Price-tier maths, integer only (BRD R3). Client-safe so the tier editor and
// the product form can preview prices live. Imports types only: the catalogue
// module (with its commercial data) must never reach the browser (R1).

const FAMILY: Record<GradeId, "Genuine" | "Aftermarket" | "Third-party"> = {
  service_pack: "Genuine",
  service_pack_preassembled: "Genuine",
  original: "Genuine",
  pulled: "Genuine",
  oem: "Aftermarket",
  soft_oled: "Aftermarket",
  hard_oled: "Aftermarket",
  refurbished: "Aftermarket",
  in_cell: "Third-party",
  compatible: "Third-party",
}

// Total percentage off for a part in a tier, before quantity breaks:
// the tier discount, plus a category rule, plus the most specific grade rule
// (one grade beats its family).
export function tierPct(tier: Tier, category: string, grade: GradeId | null) {
  const cat = tier.rules.find((r) => r.scope === "category" && r.target === category)?.pct ?? 0
  const fam = grade ? FAMILY[grade] : undefined
  const byGrade = grade ? tier.rules.find((r) => r.scope === "grade" && r.target === grade)?.pct : undefined
  const byFamily = fam ? tier.rules.find((r) => r.scope === "family" && r.target === fam)?.pct : undefined
  return tier.discount + cat + (byGrade ?? byFamily ?? 0)
}

const less = (amount: Money, pct: number) => {
  const p = Math.max(-50, Math.min(90, pct))
  const scaled = amount * (100 - p)
  const v = (scaled - (scaled % 100)) / 100
  return v - (v % 100) // whole cents
}

export function tierUnit(tier: Tier, list: Money, category: string, grade: GradeId | null, qty = 1): Money {
  const brk = [...tier.breaks].sort((a, b) => a.minQty - b.minQty).filter((b) => qty >= b.minQty).pop()?.pct ?? 0
  return less(list, tierPct(tier, category, grade) + brk)
}
