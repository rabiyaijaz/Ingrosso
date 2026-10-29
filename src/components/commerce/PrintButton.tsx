"use client"

import { DocumentText } from "@medusajs/icons"
import { Button } from "@/components/ui/Button"

// Prints the page as a clean document (header, footer, lab bar and buttons
// are hidden by the print styles in globals.css, .ig-no-print).
export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <Button variant="secondary" iconLeft={<DocumentText />} onClick={() => window.print()}>
      {label}
    </Button>
  )
}
