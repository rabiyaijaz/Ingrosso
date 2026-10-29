import { cookies } from "next/headers"
import { readCart } from "@/lib/cart"
import { DEFAULT_THEME, THEME_COOKIE, isTheme } from "@/lib/themes"
import { DEFAULT_ICON_STYLE, ICON_STYLE_COOKIE, isIconStyle } from "@/lib/icon-styles"
import { DEFAULT_LISTING, LISTING_COOKIE, isListing } from "@/lib/listing-variants"
import { LAB } from "@/lib/lab"
import { getViewer } from "@/lib/viewer"
import { LabBar } from "./LabBar"

// Renders the lab toolbar in lab builds only.
export async function Lab() {
  if (!LAB) return null
  const [viewer, cart, store] = await Promise.all([getViewer(), readCart(), cookies()])
  const saved = store.get(THEME_COOKIE)?.value
  const listing = store.get(LISTING_COOKIE)?.value
  const icons = store.get(ICON_STYLE_COOKIE)?.value
  return (
    <>
      {/* Keeps the page's last content clear of the floating toolbar */}
      <div aria-hidden className="h-24" />
      <LabBar
        state={viewer.state}
        cartLines={cart.length}
        theme={isTheme(saved) ? saved : DEFAULT_THEME}
        listing={isListing(listing) ? listing : DEFAULT_LISTING}
        icons={isIconStyle(icons) ? icons : DEFAULT_ICON_STYLE}
      />
    </>
  )
}
