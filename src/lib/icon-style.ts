import "server-only"
import { cookies } from "next/headers"
import { LAB } from "./lab"
import { DEFAULT_ICON_STYLE, ICON_STYLE_COOKIE, isIconStyle, type IconStyle } from "./icon-styles"

export * from "./icon-styles"

// Which part pictures to use at small sizes. The lab can preview either; the
// main app always uses DEFAULT_ICON_STYLE.
export async function getIconStyle(): Promise<IconStyle> {
  if (!LAB) return DEFAULT_ICON_STYLE
  const v = (await cookies()).get(ICON_STYLE_COOKIE)?.value
  return isIconStyle(v) ? v : DEFAULT_ICON_STYLE
}
