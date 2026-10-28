"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

// Staggered section entrances. Content is visible without script; the "js"
// class opts the page into the motion defined in globals.css.
export function Reveal() {
  const pathname = usePathname()
  useEffect(() => {
    document.documentElement.classList.add("js")
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)")
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in")
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [pathname])
  return null
}
