import "server-only"
import { cookies } from "next/headers"
import { LAB } from "./lab"
import { DEFAULT_LISTING, LISTING_COOKIE, isListing, type ListingVariant } from "./listing-variants"

export * from "./listing-variants"

// Which listing layout to render. The lab can preview any; the main app
// always renders DEFAULT_LISTING.
export async function getListingVariant(): Promise<ListingVariant> {
  if (!LAB) return DEFAULT_LISTING
  const v = (await cookies()).get(LISTING_COOKIE)?.value
  return isListing(v) ? v : DEFAULT_LISTING
}
