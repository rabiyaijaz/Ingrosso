"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { clx } from "@medusajs/ui"
import { Button } from "@/components/ui/Button"
import { ChevronDown, LaptopMobile } from "@medusajs/icons"
import { DeviceFinder } from "@/components/catalog/DeviceFinder"
import type { DeviceTree } from "@/lib/public"

// "Shop by device" disclosure: opens the device finder under the header bar.
export function DeviceMenu({ tree }: { tree: DeviceTree }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    const onDown = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    window.addEventListener("keydown", onKey)
    window.addEventListener("mousedown", onDown)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("mousedown", onDown)
    }
  }, [open])

  return (
    <div ref={root} className="static">
      <Button
        variant="secondary"
        size="large"
        aria-expanded={open}
        aria-controls="device-menu"
        onClick={() => setOpen((o) => !o)}
      >
        <LaptopMobile />
        <span className="hidden lg:inline">Shop by device</span>
        <span className="lg:hidden">Devices</span>
        <ChevronDown className={clx("transition-transform", open && "rotate-180")} />
      </Button>
      {open && (
        <div id="device-menu" className="absolute inset-x-0 top-full z-40 bg-ui-bg-base shadow-elevation-flyout">
          <div className="mx-auto max-w-page px-[var(--ig-gutter)] py-6">
            <DeviceFinder tree={tree} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
