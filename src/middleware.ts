import { NextResponse, type NextRequest } from "next/server"

// Every page lives under a locale prefix; the bare domain goes to English.
export function middleware(req: NextRequest) {
  return NextResponse.redirect(new URL("/en", req.url))
}

export const config = { matcher: ["/"] }
