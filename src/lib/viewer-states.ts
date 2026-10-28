// Client-safe viewer definitions. Server-only session reading is in viewer.ts.
export type ViewerState = "visitor" | "pending" | "approved" | "masked" | "suspended"

export type Viewer = {
  state: ViewerState
  company?: string
  priceLists: string[] // ordered by list priority
}

export const VIEW_COOKIE = "ig_view"

export const VIEWER_STATES: { id: ViewerState; label: string }[] = [
  { id: "visitor", label: "Visitor" },
  { id: "pending", label: "Pending applicant" },
  { id: "approved", label: "Approved" },
  { id: "masked", label: "Approved, prices masked" },
  { id: "suspended", label: "Suspended" },
]
