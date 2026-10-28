"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Kbd, clx } from "@medusajs/ui"
import { MagnifyingGlass } from "@medusajs/icons"
import type { SearchHit } from "@/lib/public"
import { routes } from "@/lib/routes"

const KIND_LABEL = { model: "Device", part: "Part", category: "Category" } as const

// Typeahead over names, model codes and SKUs. "/" focuses it from anywhere.
export function SearchBox({ className }: { className?: string }) {
  const router = useRouter()
  const listId = useId()
  const input = useRef<HTMLInputElement>(null)
  const [q, setQ] = useState("")
  const [hits, setHits] = useState<SearchHit[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (e.key === "/" && !/input|textarea|select/i.test(target.tagName)) {
        e.preventDefault()
        input.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([])
      return
    }
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        const data = (await res.json()) as { hits: SearchHit[] }
        setHits(data.hits)
        setActive(-1)
      } catch {}
    }, 120)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [q])

  const go = (href: string) => {
    setOpen(false)
    input.current?.blur()
    router.push(href)
  }

  return (
    <form
      role="search"
      className={clx("relative", className)}
      onSubmit={(e) => {
        e.preventDefault()
        if (active >= 0 && hits[active]) go(hits[active].href)
        else if (q.trim()) go(routes.search(q.trim()))
      }}
    >
      <label className="flex h-11 items-center gap-2 rounded-full bg-ui-bg-field pl-4 pr-2 shadow-borders-base transition-shadow focus-within:shadow-borders-interactive-with-active">
        <MagnifyingGlass className="shrink-0 text-ui-fg-muted" />
        <span className="sr-only">Search parts, devices, model codes or SKUs</span>
        <input
          ref={input}
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setActive((a) => Math.min(a + 1, hits.length - 1))
            } else if (e.key === "ArrowUp") {
              e.preventDefault()
              setActive((a) => Math.max(a - 1, -1))
            } else if (e.key === "Escape") setOpen(false)
          }}
          placeholder="Search a part, model code (A3526, SM-S938B) or SKU"
          role="combobox"
          aria-expanded={open && hits.length > 0}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          className="h-full min-w-0 flex-1 bg-transparent txt-compact-small text-ui-fg-base placeholder:text-ui-fg-muted outline-none"
        />
        <Kbd className="hidden sm:inline-flex">/</Kbd>
      </label>

      {open && hits.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+6px)] z-50 max-h-[420px] overflow-auto rounded-xl bg-ui-bg-base p-1.5 shadow-elevation-flyout"
        >
          {hits.map((h, i) => (
            <li
              key={h.href}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault()
                go(h.href)
              }}
              onMouseEnter={() => setActive(i)}
              className={clx(
                "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2",
                i === active && "bg-ui-bg-base-hover"
              )}
            >
              <span className="w-16 shrink-0 txt-compact-xsmall text-ui-fg-muted">{KIND_LABEL[h.kind]}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate txt-compact-small-plus text-ui-fg-base">{h.title}</span>
                <span className="ig-figure block truncate txt-compact-xsmall text-ui-fg-subtle">{h.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </form>
  )
}
