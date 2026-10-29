import Image from "next/image"
import { clx } from "@medusajs/ui"
import type { Product } from "@/lib/catalog"
import { getIconStyle } from "@/lib/icon-style"
import { partImage } from "@/lib/visuals"
import { PartGlyph } from "./PartGlyph"
import { PartIcon } from "./PartIcon"

// The picture of a part everywhere it is listed. At small sizes it follows
// the icon style (simple glass icon by default, or the 3D render); the
// product page picture passes `render` to always show the 3D render (screens
// show their grade tier), falling back to the drawn glyph if none exists.
export async function PartImage({
  product,
  size,
  className,
  label,
  render = false,
}: {
  product: Pick<Product, "category" | "grade">
  size: number
  className?: string
  label?: string
  render?: boolean
}) {
  if (!render && (await getIconStyle()) === "glass") {
    // The glass frame carries its own size; the 3D render's box classes don't apply
    return <PartIcon category={product.category} px={Math.round(size * 0.9)} />
  }
  const src = partImage(product)
  if (!src) return <PartGlyph category={product.category} className={className} label={label} />
  return (
    <Image
      src={src}
      alt={label ?? ""}
      width={size}
      height={size}
      sizes={`${size}px`}
      className={clx("object-contain drop-shadow-[0_6px_10px_rgba(37,99,235,0.18)]", className)}
    />
  )
}
