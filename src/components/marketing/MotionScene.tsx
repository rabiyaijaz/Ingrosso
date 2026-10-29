"use client"

import { useEffect, useRef } from "react"
import { clx } from "@medusajs/ui"

// Living brand picture. Wraps one or more images and adds, in layers:
//   intro     the scene comes into focus from a soft blur when it loads
//   breathe   the picture slowly swells and settles, like breathing
//   glow      a light pulse behind the logo (position: glowX / glowY)
//   sweep     a band of light passes across every few seconds
//   sparkles  small glass beads rising through the light
//   parallax  the scene shifts with scroll and leans toward the cursor
// All motion stops under prefers-reduced-motion. Styles: .ig-scene in globals.css.

const SPARKLES = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  size: 4 + ((i * 7) % 6),
  delay: `${-((i * 1.3) % 9).toFixed(1)}s`,
  duration: `${8 + ((i * 5) % 6)}s`,
}))

export function MotionScene({
  children,
  glowX = "50%",
  glowY = "44%",
  sparkles = true,
  className,
}: {
  children: React.ReactNode
  glowX?: string
  glowY?: string
  sparkles?: boolean
  className?: string
}) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    el.classList.add("is-ready")
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const r = el.getBoundingClientRect()
        if (r.bottom < 0 || r.top > window.innerHeight) return
        // -1 when the scene is below the viewport centre, +1 when above it.
        const p = Math.max(-1, Math.min(1, (window.innerHeight / 2 - (r.top + r.height / 2)) / window.innerHeight))
        el.style.setProperty("--scene-p", p.toFixed(3))
      })
    }
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "touch") return
      const r = el.getBoundingClientRect()
      el.style.setProperty("--scene-px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
      el.style.setProperty("--scene-py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
    }
    const onLeave = () => {
      el.style.setProperty("--scene-px", "0")
      el.style.setProperty("--scene-py", "0")
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    el.addEventListener("pointermove", onPointer)
    el.addEventListener("pointerleave", onLeave)
    return () => {
      window.removeEventListener("scroll", onScroll)
      el.removeEventListener("pointermove", onPointer)
      el.removeEventListener("pointerleave", onLeave)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={root} className={clx("ig-scene", className)} style={{ "--glow-x": glowX, "--glow-y": glowY } as React.CSSProperties}>
      <div className="ig-scene__picture">{children}</div>
      <span aria-hidden className="ig-scene__glow" />
      <span aria-hidden className="ig-scene__sweep" />
      {sparkles && (
        <span aria-hidden className="ig-scene__sparkles">
          {SPARKLES.map((s, i) => (
            <span
              key={i}
              style={{ left: s.left, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.duration }}
            />
          ))}
        </span>
      )}
    </div>
  )
}
