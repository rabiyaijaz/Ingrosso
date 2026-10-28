import { NextResponse } from "next/server"
import { searchCatalog } from "@/lib/public"

export function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? ""
  return NextResponse.json({ hits: searchCatalog(q.slice(0, 80)) })
}
