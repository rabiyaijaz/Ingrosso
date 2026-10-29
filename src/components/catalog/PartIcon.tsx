import { clx } from "@medusajs/ui"

// Simple glass part icons for small sizes, where the 3D renders are too busy
// to recognise. One plain glyph per category on a 24px grid, drawn in
// currentColor with a soft tinted fill, so every theme recolours them.
// framed: inside the .ig-icon-frame glass square (rows, cards, tags);
// bare: the glyph alone (pills, per the frame-or-no-frame rule).

const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const
const TINT = { fill: "currentColor", fillOpacity: 0.16, stroke: "none" } as const

const GLYPHS: Record<string, React.ReactNode> = {
  // Phone face with the screen glowing
  screens: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="3" {...S} />
      <rect x="8" y="5" width="8" height="13" rx="1.2" {...TINT} />
      <path d="M10.5 4h3" {...S} />
    </>
  ),
  // Cell with terminal and charge bolt
  batteries: (
    <>
      <rect x="6.5" y="4.5" width="11" height="17" rx="2.5" {...S} />
      <path d="M10 2.5h4" {...S} />
      <rect x="8.5" y="12" width="7" height="7.5" rx="1" {...TINT} />
      <path d="M12.8 8l-2.3 3.6h3l-2.3 3.6" {...S} />
    </>
  ),
  // USB-C plug on a flex
  "charging-ports": (
    <>
      <rect x="4" y="9" width="16" height="6.5" rx="3.25" {...S} />
      <rect x="7.5" y="11.3" width="9" height="2" rx="1" {...TINT} />
      <path d="M12 15.5v3.5M9 21h6" {...S} />
      <path d="M8 9V6.5M16 9V6.5" {...S} />
    </>
  ),
  // Camera module with two lenses
  cameras: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="4" {...S} />
      <circle cx="9.5" cy="12" r="3.3" {...S} />
      <circle cx="9.5" cy="12" r="1.4" {...TINT} />
      <circle cx="16" cy="9.2" r="1.6" {...S} />
      <circle cx="16" cy="14.8" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  // Phone back with the camera bump
  "back-glass": (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="3" {...S} />
      <rect x="7.5" y="4" width="9" height="16" rx="2" {...TINT} />
      <rect x="8" y="4.5" width="4.5" height="4.5" rx="1.4" {...S} />
    </>
  ),
  // Screw
  "small-parts": (
    <>
      <circle cx="12" cy="6.5" r="4" {...S} />
      <circle cx="12" cy="6.5" r="4" {...TINT} />
      <path d="M10.3 6.5h3.4M12 4.8v3.4" {...S} />
      <path d="M10 10.3v6.2l2 3.5 2-3.5v-6.2M10 13h4M10 15.6h4" {...S} />
    </>
  ),
  // Screwdriver
  tools: (
    <>
      <rect x="9.5" y="2.5" width="5" height="9" rx="2" {...S} />
      <rect x="10.5" y="4" width="3" height="6" rx="1" {...TINT} />
      <path d="M12 11.5v6.5M10.6 18h2.8l-1.4 3.5z" {...S} />
    </>
  ),
}

// The glyphs a category can use, for the trade desk's icon picker
export const GLYPH_KEYS = Object.keys(GLYPHS)

export function PartGlassGlyph({ category, className }: { category: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={clx("shrink-0", className)}>
      {GLYPHS[category] ?? GLYPHS.tools}
    </svg>
  )
}

type Size = "xs" | "sm" | "md" | "lg" | "xl"

// px sets an exact frame size (product cards); otherwise the named size.
export function PartIcon({ category, size = "md", px, bare = false, className }: { category: string; size?: Size; px?: number; bare?: boolean; className?: string }) {
  if (bare) return <PartGlassGlyph category={category} className={clx("size-[18px]", className)} />
  return (
    <span
      className={clx("ig-icon-frame ig-glass-icon", className)}
      data-size={px ? undefined : size}
      style={px ? ({ "--frame": `${px}px` } as React.CSSProperties) : undefined}
    >
      <PartGlassGlyph category={category} />
    </span>
  )
}
