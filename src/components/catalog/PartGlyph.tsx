import { clx } from "@medusajs/ui"

// Drawn stand-ins for product photography, one flat graphic language in the
// brand ramp. Replace with licensed product photos (BRD CAT-08) when supplied.
const PATHS: Record<string, React.ReactNode> = {
  screens: (
    <>
      <rect x="22" y="6" width="36" height="68" rx="7" fill="var(--ig-grade-4)" />
      <rect x="25" y="10" width="30" height="60" rx="4.5" fill="var(--ig-grade-1)" />
      <rect x="35" y="12" width="10" height="3" rx="1.5" fill="var(--ig-grade-4)" />
      <path d="M29 58 L51 22" stroke="var(--ig-grade-6)" strokeWidth="2" opacity=".6" />
    </>
  ),
  batteries: (
    <>
      <rect x="20" y="12" width="40" height="58" rx="5" fill="var(--ig-grade-3)" />
      <rect x="26" y="8" width="16" height="8" rx="2" fill="var(--ig-grade-6)" />
      <rect x="25" y="20" width="30" height="12" rx="2" fill="var(--ig-grade-9)" />
      <path d="M38 40 l-6 12 h7 l-3 10 l9 -14 h-7 l3 -8 z" fill="var(--ig-grade-10)" />
    </>
  ),
  "charging-ports": (
    <>
      <path d="M12 40 h22 v-12 h12 v24 h-12 v-12" fill="none" stroke="var(--ig-grade-6)" strokeWidth="4" strokeLinejoin="round" />
      <rect x="44" y="30" width="24" height="20" rx="5" fill="var(--ig-grade-2)" />
      <rect x="49" y="37" width="14" height="6" rx="3" fill="var(--ig-grade-8)" />
      <circle cx="16" cy="40" r="5" fill="var(--ig-grade-4)" />
    </>
  ),
  cameras: (
    <>
      <rect x="14" y="14" width="52" height="52" rx="12" fill="var(--ig-grade-2)" />
      <circle cx="31" cy="31" r="10" fill="var(--ig-grade-5)" />
      <circle cx="31" cy="31" r="5" fill="var(--ig-grade-1)" />
      <circle cx="31" cy="51" r="10" fill="var(--ig-grade-5)" />
      <circle cx="31" cy="51" r="5" fill="var(--ig-grade-1)" />
      <circle cx="52" cy="41" r="10" fill="var(--ig-grade-5)" />
      <circle cx="52" cy="41" r="5" fill="var(--ig-grade-1)" />
    </>
  ),
  "back-glass": (
    <>
      <rect x="22" y="6" width="36" height="68" rx="7" fill="var(--ig-grade-8)" />
      <rect x="26" y="10" width="14" height="14" rx="4" fill="var(--ig-grade-4)" />
      <circle cx="40" cy="44" r="6" fill="var(--ig-grade-10)" />
    </>
  ),
  "small-parts": (
    <>
      {[16, 32, 48].map((x, i) => (
        <g key={x} transform={`translate(${x} ${14 + i * 4})`}>
          <circle cx="8" cy="8" r="8" fill="var(--ig-grade-3)" />
          <path d="M8 3 l1.6 3.4 3.7.4 -2.8 2.5 .8 3.6 -3.3-1.9 -3.3 1.9 .8-3.6 -2.8-2.5 3.7-.4z" fill="var(--ig-grade-9)" />
          <rect x="5" y="16" width="6" height="30" rx="2" fill="var(--ig-grade-6)" />
        </g>
      ))}
    </>
  ),
  tools: (
    <>
      <rect x="35" y="6" width="10" height="34" rx="4" fill="var(--ig-grade-2)" />
      <rect x="37.5" y="40" width="5" height="26" rx="1.5" fill="var(--ig-grade-7)" />
      <path d="M37.5 66 h5 l-2.5 8 z" fill="var(--ig-grade-7)" />
      <rect x="35" y="14" width="10" height="3" fill="var(--ig-grade-5)" />
    </>
  ),
}

export function PartGlyph({ category, className, label }: { category: string; className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={clx("block", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {PATHS[category] ?? PATHS.tools}
    </svg>
  )
}
