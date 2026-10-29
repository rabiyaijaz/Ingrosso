import { clx } from "@medusajs/ui"

// A tick that draws itself once, for the moment something is done (order
// placed, application sent). Takes the current text colour. Still under
// reduced motion (globals.css .ig-check-draw).
export function CheckDraw({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={clx("ig-check-draw shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.14" stroke="none" />
      <path d="M7.5 12.5l3 3 6-6.5" pathLength={1} />
    </svg>
  )
}
