import { readCart } from "@/lib/cart"
import { LAB } from "@/lib/lab"
import { getViewer } from "@/lib/viewer"
import { LabBar } from "./LabBar"

// Renders the lab toolbar in lab builds only.
export async function Lab() {
  if (!LAB) return null
  const [viewer, cart] = await Promise.all([getViewer(), readCart()])
  return (
    <>
      {/* Keeps the page's last content clear of the floating toolbar */}
      <div aria-hidden className="h-24" />
      <LabBar state={viewer.state} cartLines={cart.length} />
    </>
  )
}
