import Image from "next/image"
import { clx } from "@medusajs/ui"
import type { Product } from "@/lib/catalog"
import { partImage } from "@/lib/visuals"
import { PartGlyph } from "./PartGlyph"

// The picture of a part everywhere it is listed: the brand's 3D render for
// its category (screens show their grade tier), or the drawn glyph if none.
export function PartImage({
  product,
  size,
  className,
  label,
}: {
  product: Pick<Product, "category" | "grade">
  size: number
  className?: string
  label?: string
}) {
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
