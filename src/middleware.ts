import { NextResponse, type NextRequest } from "next/server"
import { LAB } from "@/lib/lab"
import { LISTING_COOKIE, isListing } from "@/lib/listing-variants"
import { THEME_COOKIE, isTheme } from "@/lib/themes"

const COOKIE = { path: "/", sameSite: "lax" as const, maxAge: 60 * 60 * 24 * 30 }

export function middleware(req: NextRequest) {
  // Every page lives under a locale prefix; the bare domain goes to English.
  if (req.nextUrl.pathname === "/") return NextResponse.redirect(new URL("/en", req.url))
  if (!LAB) return NextResponse.next()

  // Lab only: ?theme=cobalt and ?listing=sidebar preview a colour theme or a
  // listing layout and remember it, so each can be opened or shared by link.
  const theme = req.nextUrl.searchParams.get("theme") ?? undefined
  const listing = req.nextUrl.searchParams.get("listing") ?? undefined
  const set: [string, string][] = []
  if (isTheme(theme)) set.push([THEME_COOKIE, theme])
  if (isListing(listing)) set.push([LISTING_COOKIE, listing])
  if (!set.length) return NextResponse.next()

  set.forEach(([k, v]) => req.cookies.set(k, v))
  const res = NextResponse.next({ request: { headers: req.headers } })
  set.forEach(([k, v]) => res.cookies.set(k, v, COOKIE))
  return res
}

export const config = { matcher: ["/((?!_next|api|brand|icons|favicon).*)"] }
