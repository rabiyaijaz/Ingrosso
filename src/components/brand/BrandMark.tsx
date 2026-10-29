import { clx } from "@medusajs/ui"
import { siApple, siGoogle, siSamsung, siXiaomi, type SimpleIcon } from "simple-icons"

// Device-brand logos (from Simple Icons) in the Ingrosso glass style. The
// logo is drawn in ink and takes the brand's own colour when its row or tile
// is hovered. Logos show compatibility only; the trademark note is in the
// footers.
// viewBox crops a wordmark to its height so it reads at small sizes; wide
// marks get a wider tile.
const MARKS: Record<string, { icon: SimpleIcon; viewBox?: string; wide?: boolean }> = {
  apple: { icon: siApple },
  samsung: { icon: siSamsung, viewBox: "0 9.3 24 5.4", wide: true },
  google: { icon: siGoogle },
  xiaomi: { icon: siXiaomi },
}

const WIDE = {
  xs: "h-5 w-11 rounded-[6px] [&_svg]:h-[9px] [&_svg]:w-9",
  sm: "h-7 w-14 rounded-[9px] [&_svg]:h-[10px] [&_svg]:w-11",
  md: "h-9 w-[72px] rounded-[11px] [&_svg]:h-3 [&_svg]:w-14",
  lg: "h-14 w-[104px] rounded-[16px] [&_svg]:h-[18px] [&_svg]:w-20",
}

const SIZES = {
  xs: "size-5 rounded-[6px] [&_svg]:size-3",
  sm: "size-7 rounded-[9px] [&_svg]:size-4",
  md: "size-9 rounded-[11px] [&_svg]:size-5",
  lg: "size-14 rounded-[16px] [&_svg]:size-7",
}

export function BrandMark({
  brand,
  size = "sm",
  variant = "glass",
  className,
}: {
  brand: string
  size?: keyof typeof SIZES
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
      className={clx("ig-glass-icon inline-flex shrink-0 items-center justify-center", mark.wide ? WIDE[size] : SIZES[size], className)}
      style={{ "--brand": `#${icon.hex}` } as React.CSSProperties}
    >
      {svg}
    </span>
  )
}
