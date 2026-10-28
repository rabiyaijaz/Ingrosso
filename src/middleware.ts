import { NextResponse, type NextRequest } from "next/server"
import { LAB } from "@/lib/lab"
import { THEME_COOKIE, isTheme } from "@/lib/themes"

export function middleware(req: NextRequest) {
  // Every page lives under a locale prefix; the bare domain goes to English.
  if (req.nextUrl.pathname === "/") return NextResponse.redirect(new URL("/en", req.url))

  // Lab only: ?theme=cobalt (etc.) previews a colour theme and remembers it,
  // so each theme can be opened or shared by link.
  const theme = req.nextUrl.searchParams.get("theme") ?? undefined
  if (LAB && isTheme(theme)) {
    req.cookies.set(THEME_COOKIE, theme)
    const res = NextResponse.next({ request: { headers: req.headers } })
    res.cookies.set(THEME_COOKIE, theme, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 30 })
    return res
  }
  return NextResponse.next()
}

export const config = { matcher: ["/((?!_next|api|brand|icons|favicon).*)"] }
