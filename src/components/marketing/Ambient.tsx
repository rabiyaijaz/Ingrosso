"use client"

import { useEffect, useRef } from "react"

// Ambient section background: a soft gradient with slowly drifting light,
// moved at a slower rate than the page as it scrolls (parallax). Sits behind
// a section's content; styles in globals.css (.ig-ambient). Motion stops
// under prefers-reduced-motion.
export function Ambient({ variant = "soft" }: { variant?: "soft" | "deep" | "bright" | "blue" }) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let frame = 0
    const update = () => {
      frame = 0
      const r = el.getBoundingClientRect()
      if (r.bottom < 0 || r.top > window.innerHeight) return
      // Offset of the section's centre from the viewport's centre, slowed down.
      const offset = (r.top + r.height / 2 - window.innerHeight / 2) * -0.14
      el.style.setProperty("--ig-parallax", `${offset.toFixed(1)}px`)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={root} aria-hidden data-variant={variant} className="ig-ambient">
      <div className="ig-ambient__layer">
        <span className="ig-orb ig-orb--1" />
        <span className="ig-orb ig-orb--2" />
        <span className="ig-orb ig-orb--3" />
      </div>
    </div>
  )
}
