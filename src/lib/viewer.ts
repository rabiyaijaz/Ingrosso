import "server-only"
import { cookies } from "next/headers"
import { VIEW_COOKIE, VIEWER_STATES, type Viewer, type ViewerState } from "./viewer-states"

export * from "./viewer-states"

// Design-review stand-in for the real session. In production identity is
// resolved live per request by the database (BRD NFR-01, R5).
export async function getViewer(): Promise<Viewer> {
  const store = await cookies()
  const raw = store.get(VIEW_COOKIE)?.value as ViewerState | undefined
  const state = VIEWER_STATES.some((s) => s.id === raw) ? raw! : "visitor"
  if (state === "visitor") return { state, priceLists: [] }
  return { state, company: "Fix Point Repairs B.V.", priceLists: state === "pending" || state === "suspended" ? [] : ["trade-standard"] }
}
