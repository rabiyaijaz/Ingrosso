"use client"

import { clx } from "@medusajs/ui"
import { Minus, Plus } from "@medusajs/icons"

type Props = {
  value: number
  onChange: (n: number) => void
  step?: number
  min?: number
  size?: "small" | "base"
  label: string
  className?: string
}

// Quantity input that respects the product's order step (sold in 50s, etc.).
export function QuantityStepper({ value, onChange, step = 1, min = step, size = "base", label, className }: Props) {
  const h = size === "small" ? "h-8" : "h-10"
  const snap = (n: number) => Math.max(min, Math.ceil(n / step) * step)
  return (
    <div
      className={clx(
        "inline-flex items-stretch overflow-hidden rounded-md bg-ui-bg-field shadow-borders-base focus-within:shadow-borders-interactive-with-active",
        h,
        className
      )}
    >
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        onClick={() => onChange(snap(value - step))}
        disabled={value <= min}
        className="grid w-8 place-items-center text-ui-fg-subtle hover:bg-ui-bg-field-hover hover:text-ui-fg-base disabled:text-ui-fg-disabled disabled:hover:bg-transparent"
      >
        <Minus />
      </button>
      <input
        aria-label={label}
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value.replace(/\D/g, ""))
          if (Number.isFinite(n)) onChange(n)
        }}
        onBlur={() => onChange(snap(value || min))}
        className="ig-figure w-14 bg-transparent text-center txt-compact-small text-ui-fg-base outline-none"
      />
      <button
        type="button"
        aria-label={`Increase ${label}`}
        onClick={() => onChange(snap(value + step))}
        className="grid w-8 place-items-center text-ui-fg-subtle hover:bg-ui-bg-field-hover hover:text-ui-fg-base"
      >
        <Plus />
      </button>
    </div>
  )
}
