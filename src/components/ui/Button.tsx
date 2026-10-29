"use client"

import { forwardRef, useCallback, useRef, useState } from "react"
import { Slot } from "radix-ui"
import { clx } from "@medusajs/ui"

// The one button in Ingrosso. Every button and button-styled link uses it.
// Styles live in globals.css (.ig-btn), from tokens, so every theme follows.
//
//   variant  primary | secondary | ink | ghost | danger
//   size     sm | md | lg | xl
//   iconLeft / iconRight  any icon; iconOnly for a round icon button
//   burst    glassy particle burst on press (on by default for primary lg/xl)
//   asChild  render as the child element (a Next <Link>) with button styling
//
// Medusa's prop names are accepted too (variant "transparent", size "small" |
// "base" | "large" | "xlarge", isLoading), so it drops in for @medusajs/ui.

type Variant = "primary" | "secondary" | "ink" | "ghost" | "danger"
type Size = "sm" | "md" | "lg" | "xl"

const VARIANT_ALIAS: Record<string, Variant> = { transparent: "ghost" }
const SIZE_ALIAS: Record<string, Size> = { small: "sm", base: "md", large: "lg", xlarge: "xl" }

export type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  variant?: Variant | "transparent"
  size?: Size | "small" | "base" | "large" | "xlarge"
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  iconOnly?: boolean
  burst?: boolean
  isLoading?: boolean
  asChild?: boolean
  children?: React.ReactNode
}

type Burst = { id: number; x: number; y: number }

let burstId = 0

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", iconLeft, iconRight, iconOnly, burst, isLoading, asChild, className, children, onPointerDown, disabled, ...rest },
  ref
) {
  const v: Variant = VARIANT_ALIAS[variant] ?? (variant as Variant)
  const s: Size = SIZE_ALIAS[size] ?? (size as Size)
  const withBurst = burst ?? (v === "primary" && (s === "lg" || s === "xl"))
  const [bursts, setBursts] = useState<Burst[]>([])
  const reduced = useRef<boolean | null>(null)

  const spawn = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!withBurst) return
      if (reduced.current === null) reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      if (reduced.current) return
      const r = e.currentTarget.getBoundingClientRect()
      const b = { id: ++burstId, x: e.clientX - r.left, y: e.clientY - r.top }
      setBursts((list) => [...list, b])
      window.setTimeout(() => setBursts((list) => list.filter((x) => x.id !== b.id)), 750)
    },
    [withBurst]
  )

  const Comp = asChild ? Slot.Root : "button"
  const burstNodes = bursts.map((b) => (
    <span key={b.id} aria-hidden className="ig-burst" style={{ left: b.x, top: b.y }}>
      <span className="ig-burst__ring" />
      {Array.from({ length: 8 }, (_, i) => (
        <span key={i} className="ig-burst__dot" style={{ "--a": `${i * 45 + 20}deg` } as React.CSSProperties} />
      ))}
    </span>
  ))

  return (
    <Comp
      ref={ref}
      data-variant={v}
      data-size={s}
      data-icon-only={iconOnly || undefined}
      aria-busy={isLoading || undefined}
      disabled={asChild ? undefined : disabled || isLoading}
      className={clx(
        "ig-btn",
        v === "primary" && "ig-btn-primary",
        v === "secondary" && "ig-btn-secondary",
        className
      )}
      onPointerDown={(e: React.PointerEvent<HTMLButtonElement>) => {
        spawn(e)
        onPointerDown?.(e)
      }}
      {...(asChild ? {} : { type: rest.type ?? "button" })}
      {...rest}
    >
      {/* Direct children (no fragment) so asChild's Slot can find the Slottable. */}
      <span aria-hidden className="ig-btn__sheen" />
      {isLoading ? <span aria-hidden className="ig-btn__spinner" /> : iconLeft}
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
      {iconRight}
      {burstNodes}
    </Comp>
  )
})
