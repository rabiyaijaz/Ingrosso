"use client"

import { RadioGroup, clx } from "@medusajs/ui"

// A plain icon in the accent colour, no frame, for the head of a card
// (address, delivery, payment, order). Size sets the glyph: sm 16, md 20, lg 24.
export function CardIcon({ children, size = "md" }: { children: React.ReactNode; size?: "sm" | "md" | "lg" }) {
  const px = { sm: "[&_svg]:size-4", md: "[&_svg]:size-5", lg: "[&_svg]:size-6" }[size]
  return (
    <span aria-hidden className={clx("inline-flex shrink-0 text-ui-fg-interactive", px)}>
      {children}
    </span>
  )
}

// One option in a radio group as a card: icon, name, detail, and the radio.
// The whole card is the hit target; the chosen card takes the accent ring.
export function ChoiceCard({ value, icon, label, detail, aside }: { value: string; icon: React.ReactNode; label: string; detail: string; aside?: React.ReactNode }) {
  const id = `choice-${value}`
  return (
    <label
      htmlFor={id}
      className={clx(
        "flex cursor-pointer items-center gap-4 rounded-2xl bg-ui-bg-base p-4 shadow-elevation-card-rest outline-none transition-shadow",
        "hover:shadow-elevation-card-hover has-[[data-state=checked]]:shadow-borders-interactive-with-active has-[:focus-visible]:shadow-borders-focus"
      )}
    >
      <CardIcon>{icon}</CardIcon>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex flex-wrap items-baseline justify-between gap-x-3 txt-compact-medium-plus text-ui-fg-base">
          {label}
          {aside && <span className="txt-compact-small-plus text-ui-fg-base">{aside}</span>}
        </span>
        <span className="txt-compact-small text-ui-fg-subtle">{detail}</span>
      </span>
      <RadioGroup.Item id={id} value={value} />
    </label>
  )
}
