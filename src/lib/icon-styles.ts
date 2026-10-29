// How parts are pictured at small sizes (top navigation, product rows,
// cards, grade comparison). Client-safe. The landing tiles and the product
// page picture always use the 3D renders.
export const ICON_STYLES = [
  { id: "glass", label: "Simple glass" },
  { id: "render", label: "3D renders" },
] as const

export type IconStyle = (typeof ICON_STYLES)[number]["id"]

export const DEFAULT_ICON_STYLE: IconStyle = "glass"

export const ICON_STYLE_COOKIE = "ig_lab_icons"

export const isIconStyle = (v: string | undefined): v is IconStyle => ICON_STYLES.some((x) => x.id === v)
