"use client"

import { useEffect, useState } from "react"

// Rotating trade promises in the top strip. Each line slides up into place;
// only facts the shop already states elsewhere (delivery, grading, approval).
export function StripTicker({ lines }: { lines: string[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (lines.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const t = setInterval(() => setI((n) => (n + 1) % lines.length), 4200)
    return () => clearInterval(t)
  }, [lines.length])
  return (
    <span className="ig-ticker">
      <span key={i} className="ig-ticker__line">
        <span aria-hidden className="ig-ticker__spark" />
        {lines[i]}
      </span>
    </span>
  )
}
