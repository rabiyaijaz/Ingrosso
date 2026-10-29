import type { GradeId, Product } from "./catalog"

// Brand 3D renders (public/parts, public/ecosystem), one place for every
// picture of a part or device family. Swap a file here and it changes app-wide.

export const CATEGORY_IMAGE: Record<string, string> = {
  screens: "/parts/screens.webp",
  batteries: "/parts/batteries.webp",
  "charging-ports": "/parts/charging-ports.webp",
  cameras: "/parts/cameras.webp",
  "back-glass": "/parts/back-glass.webp",
  "small-parts": "/parts/small-parts.webp",
  // No render in the brand library yet; the earlier glass render stands in
  tools: "/icons/part-tools-glass.webp",
}

// Screen grade tiers. Grades without their own render use the plain screen.
const SCREEN_TIER: Partial<Record<GradeId, string>> = {
  service_pack: "/parts/tier-1.webp",
  service_pack_preassembled: "/parts/tier-1.webp",
  original: "/parts/tier-1.webp",
  pulled: "/parts/tier-2.webp",
  refurbished: "/parts/tier-2.webp",
  soft_oled: "/parts/tier-3.webp",
  in_cell: "/parts/tier-4.webp",
  compatible: "/parts/tier-4.webp",
}

export function partImage(p: Pick<Product, "category" | "grade">): string | null {
  if (p.category === "screens" && p.grade && SCREEN_TIER[p.grade]) return SCREEN_TIER[p.grade]!
  return CATEGORY_IMAGE[p.category] ?? null
}

export const BRAND_IMAGE: Record<string, string> = {
  apple: "/ecosystem/apple.webp",
  samsung: "/ecosystem/samsung.webp",
  google: "/ecosystem/google.webp",
  xiaomi: "/ecosystem/xiaomi.webp",
}
export const ALL_BRANDS_IMAGE = "/ecosystem/all.png"
