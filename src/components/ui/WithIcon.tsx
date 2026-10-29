import { clx } from "@medusajs/ui"

// A small leading icon for a text field, in the muted ink, that takes the
// accent while the field has focus. Wraps any input (Medusa Input or a plain
// <input>); the field's left padding is set in globals.css (.ig-with-icon).
export function WithIcon({ icon, children, className }: { icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={clx("ig-with-icon relative", className)}>
      <span aria-hidden className="ig-with-icon__icon">{icon}</span>
      {children}
    </div>
  )
}
