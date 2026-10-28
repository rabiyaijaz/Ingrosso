// Client-safe viewer definitions. Server-only session reading is in viewer.ts.
import { LAB } from "./lab"

export type ViewerState = "visitor" | "pending" | "approved" | "masked" | "suspended"

export type Viewer = {
  state: ViewerState
  company?: string
  priceLists: string[] // ordered by list priority
}

// Lab cookies are named apart: localhost shares cookies across ports, so the
// lab (3311) and the main app (3310) would otherwise share one session.
export const VIEW_COOKIE = LAB ? "ig_lab_view" : "ig_view"

export const VIEWER_STATES: { id: ViewerState; label: string }[] = [
  { id: "visitor", label: "Visitor" },
  { id: "pending", label: "Pending applicant" },
  { id: "approved", label: "Approved" },
  { id: "masked", label: "Approved, prices masked" },
  { id: "suspended", label: "Suspended" },
]
