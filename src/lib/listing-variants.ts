// Listing layouts for part lists (category, device model, search). Client-safe.
export const LISTING_VARIANTS = [
  { id: "current", label: "Current" },
  { id: "sidebar", label: "A · Filter sidebar" },
  { id: "topbar", label: "B · Top filters + cards" },
  { id: "tabs", label: "C · Grade tabs" },
] as const

export type ListingVariant = (typeof LISTING_VARIANTS)[number]["id"]

export const DEFAULT_LISTING: ListingVariant = "current"

export const LISTING_COOKIE = "ig_lab_listing"

export const isListing = (v: string | undefined): v is ListingVariant => LISTING_VARIANTS.some((x) => x.id === v)
