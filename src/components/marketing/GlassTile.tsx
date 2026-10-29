"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"
import { ArrowRight, LaptopMobile } from "@medusajs/icons"

// Glossy, glass-framed tile that tilts toward the cursor, with a light sweep
// on hover. The picture fills the top; the label sits on a frosted strip
// below it, so text never covers the picture or wraps. Styles in
// globals.css (.ig-tile). Used for the landing part tiles and the
// "shop by device" tile beside them.

function useTilt() {
  const ref = useRef<HTMLAnchorElement>(null)
  const move = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || e.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty("--ry", `${((x - 0.5) * 8).toFixed(2)}deg`)
    el.style.setProperty("--rx", `${((0.5 - y) * 8).toFixed(2)}deg`)
    el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`)
    el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`)
  }
  const leave = () => {
    const el = ref.current
    if (!el) return
    ;["--rx", "--ry"].forEach((p) => el.style.setProperty(p, "0deg"))
  }
  return { ref, onPointerMove: move, onPointerLeave: leave }
}

export function GlassTile({ href, src, label, detail }: { href: string; src: string; label: string; detail?: string }) {
  const tilt = useTilt()
  return (
    <Link href={href} {...tilt} className="ig-tile group">
      <span className="ig-tile__frame">
        <span className="ig-tile__media">
          <span aria-hidden className="ig-tile__aura" />
          <Image src={src} alt="" fill sizes="(min-width:1024px) 22vw, 45vw" className="object-contain p-3" />
          <span className="ig-tile__glare" />
        </span>
        <span className="ig-tile__caption">
          <span className="ig-tile__label">{label}</span>
          {detail && <span className="ig-tile__detail">{detail}</span>}
        </span>
      </span>
    </Link>
  )
}

// Same light, breathing background as the part tiles. Pass `src` to show a
// picture; without one it shows the device icon and the title.
export function GlassActionTile({ href, title, action, src }: { href: string; title: string; action: string; src?: string }) {
  const tilt = useTilt()
  return (
    <Link href={href} {...tilt} className="ig-tile group">
      <span className="ig-tile__frame">
        <span className="ig-tile__media">
          <span aria-hidden className="ig-tile__aura" />
          {src ? (
            <Image src={src} alt="" fill sizes="(min-width:1024px) 22vw, 45vw" className="object-contain p-3" />
          ) : (
            <span className="relative z-[1] flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
              <span className="ig-icon-frame ig-glass-icon" data-size="lg" data-family="Aftermarket">
                <LaptopMobile />
              </span>
              <span className="text-[17px] font-medium leading-snug text-white">{title}</span>
            </span>
          )}
          <span className="ig-tile__glare" />
        </span>
        <span className="ig-tile__caption">
          <span className="ig-tile__label">{action}</span>
          <ArrowRight className="text-ig-blue transition-transform group-hover:translate-x-1" />
        </span>
      </span>
    </Link>
  )
}
