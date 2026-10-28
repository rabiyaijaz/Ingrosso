import { clx } from "@medusajs/ui"

// Every price, SKU, stock count, quantity and order reference renders through
// this, so digits align in columns and a misread one is obvious (NFR-05).
export function Figure({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={clx("ig-figure", className)}>{children}</span>
}
