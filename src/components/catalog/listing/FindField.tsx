"use client"

import { useId, useRef, useState } from "react"
import { clx } from "@medusajs/ui"
import { MagnifyingGlass, XMarkMini } from "@medusajs/icons"
import { Highlight } from "@/components/layout/SearchBox"
import type { FindOption } from "./model"

// "Search within these parts", with suggestions from the parts in the list:
// on focus, the models it covers; from the first letter, the models and SKUs
// that start with it, best first. Picking one (or pressing Enter) submits the
// plain GET form, so the search sits in the URL with every other filter.
export function FindField({
  action,
  hidden,
  initial,
  options,
  className,
}: {
  action: string
  hidden: [string, string][]
  initial?: string
  options: FindOption[]
  className?: string
}) {
  const form = useRef<HTMLFormElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const listId = useId()
  const [q, setQ] = useState(initial ?? "")
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)

  const needle = q.trim().toLowerCase()
  const wordStart = (s: string) => s.toLowerCase().split(/[\s\-·,()]+/).some((w) => w.startsWith(needle))
  const list = !needle
    ? options.filter((o) => o.kind === "model").slice(0, 6)
    : [
        ...options.filter((o) => o.label.toLowerCase().startsWith(needle)),
        ...options.filter((o) => !o.label.toLowerCase().startsWith(needle) && (wordStart(o.label) || (o.kind === "model" && wordStart(o.detail)))),
      ]
        .filter((o) => o.kind === "model" || needle.length >= 2)
        .slice(0, 7)

  const pick = (value: string) => {
    setQ(value)
    setOpen(false)
    // Let the input take the value before the form posts it
    requestAnimationFrame(() => form.current?.requestSubmit())
  }

  return (
    <form ref={form} action={action} method="get" role="search" className={clx("relative", className)}>
      {hidden.map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <MagnifyingGlass aria-hidden className="pointer-events-none absolute left-3 top-[18px] -translate-y-1/2 text-ui-fg-muted" />
      <input
        ref={input}
        type="search"
        name="find"
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
          setActive(-1)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setActive((a) => Math.min(a + 1, list.length - 1))
          } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setActive((a) => Math.max(a - 1, -1))
          } else if (e.key === "Enter" && active >= 0 && list[active]) {
            e.preventDefault()
            pick(list[active].value)
          } else if (e.key === "Escape") setOpen(false)
        }}
        aria-label="Search within these parts"
        placeholder="Model, code or SKU"
        role="combobox"
        aria-expanded={open && list.length > 0}
        aria-controls={listId}
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        className="h-9 w-full rounded-full bg-ui-bg-field pl-9 pr-8 txt-compact-small text-ui-fg-base shadow-borders-base outline-none transition-shadow placeholder:text-ui-fg-muted hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active [&::-webkit-search-cancel-button]:hidden"
      />
      {q && (
        <button
          type="button"
          aria-label="Clear"
          onMouseDown={(e) => {
            e.preventDefault()
            setQ("")
            input.current?.focus()
          }}
          className="absolute right-2 top-[18px] grid size-5 -translate-y-1/2 place-items-center rounded-full text-ui-fg-muted hover:bg-ui-bg-base-hover hover:text-ui-fg-base"
        >
          <XMarkMini />
        </button>
      )}

      {open && list.length > 0 && (
        <ul id={listId} role="listbox" className="ig-no-scrollbar absolute inset-x-0 top-[calc(100%+6px)] z-40 max-h-[320px] overflow-auto rounded-2xl bg-ui-bg-base p-1.5 shadow-elevation-flyout">
          {!needle && <li className="px-2.5 pb-1 pt-1.5 txt-compact-xsmall-plus uppercase tracking-[0.06em] text-ui-fg-muted">Models in this list</li>}
          {list.map((o, i) => (
            <li
              key={`${o.kind}-${o.value}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault()
                pick(o.value)
              }}
              onMouseEnter={() => setActive(i)}
              className={clx("flex cursor-pointer flex-col rounded-lg px-2.5 py-1.5", i === active && "bg-ui-bg-base-hover")}
            >
              <span className={clx("truncate txt-compact-small text-ui-fg-base", o.kind === "sku" && "font-mono")}>
                <Highlight text={o.label} q={q} />
              </span>
              <span className="truncate txt-compact-xsmall text-ui-fg-subtle">{o.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </form>
  )
}
