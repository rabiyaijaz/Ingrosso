"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Select, clx } from "@medusajs/ui"
import { ChevronDown } from "@medusajs/icons"

// Sort control. Each option carries its own URL, so sorting stays shareable.
export function SortSelect({ value, options }: { value: string; options: { value: string; label: string; href: string }[] }) {
  const router = useRouter()
  return (
    <label className="flex items-center gap-2 txt-compact-small text-ui-fg-subtle">
      <span className="whitespace-nowrap">Sort by</span>
      <Select value={value || "best"} onValueChange={(v) => router.push(options.find((o) => (o.value || "best") === v)!.href, { scroll: false })}>
        <Select.Trigger className="h-9 min-w-[190px] rounded-full" aria-label="Sort by">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {options.map((o) => (
            <Select.Item key={o.value || "best"} value={o.value || "best"}>{o.label}</Select.Item>
          ))}
        </Select.Content>
      </Select>
    </label>
  )
}

// A filter button that opens a panel of options under it (layout B). Built on
// <details>, so it works without script; closes on outside click and Escape.
export function FilterDropdown({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onDown = (e: MouseEvent) => !el.contains(e.target as Node) && el.removeAttribute("open")
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && el.removeAttribute("open")
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [])
  return (
    <details ref={ref} className="group/dd relative">
      <summary
        className={clx(
          "ig-btn flex list-none [&::-webkit-details-marker]:hidden",
          count ? "ig-btn-primary" : "ig-btn-secondary"
        )}
        data-variant={count ? "primary" : "secondary"}
        data-size="md"
      >
        <span aria-hidden className="ig-btn__sheen" />
        {label}
        {count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white/25 px-1.5 text-[12px] tabular-nums">{count}</span>}
        <ChevronDown className="transition-transform group-open/dd:rotate-180" />
      </summary>
      <div className="absolute left-0 top-[calc(100%+8px)] z-30 w-[300px] rounded-2xl bg-ui-bg-base p-3 shadow-elevation-flyout">{children}</div>
    </details>
  )
}
