import { clx } from "@medusajs/ui"
import { siApple, siGoogle, siSamsung, siXiaomi, type SimpleIcon } from "simple-icons"

// Device-brand logos (from Simple Icons) in the Ingrosso glass style. The
// logo is drawn in ink and takes the brand's own colour when its row or tile
// is hovered. Logos show compatibility only; the trademark note is in the
// footers.
// Glass marks use the shared rounded-square icon frame (.ig-icon-frame).
// viewBox crops a wordmark to its height so it reads at small sizes; wide
// marks get a frame twice as wide.
const MARKS: Record<string, { icon: SimpleIcon; viewBox?: string; wide?: boolean }> = {
  apple: { icon: siApple },
  samsung: { icon: siSamsung, viewBox: "0 9.3 24 5.4", wide: true },
  google: { icon: siGoogle },
  xiaomi: { icon: siXiaomi },
}

type Size = "xs" | "sm" | "md" | "lg" | "xl"

export function BrandMark({
  brand,
  size = "sm",
  variant = "glass",
  className,
}: {
  brand: string
  size?: Size
  variant?: "glass" | "plain"
  className?: string
}) {
  const mark = MARKS[brand]
  if (!mark) return null
  const { icon } = mark
  const svg = (
    <svg viewBox={mark.viewBox ?? "0 0 24 24"} preserveAspectRatio="xMidYMid meet" role="img" aria-label={`${icon.title} logo`} fill="currentColor">
      <path d={icon.path} />
    </svg>
  )
  if (variant === "plain") {
    return (
      <span
        className={clx("inline-flex shrink-0", mark.wide ? "[&_svg]:h-2.5 [&_svg]:w-11" : "[&_svg]:size-4", className)}
        style={{ "--brand": `#${icon.hex}` } as React.CSSProperties}
      >
        {svg}
      </span>
    )
  }
  return (
    <span
      data-family="Brand"
      data-size={size}
      data-wide={mark.wide || undefined}
      className={clx("ig-icon-frame ig-glass-icon", className)}
      style={{ "--brand": `#${icon.hex}` } as React.CSSProperties}
    >
      {svg}
    </span>
  )
}
