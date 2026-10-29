"use client"

import { useEffect, useId, useRef, useState } from "react"
import { chipClass } from "@/components/ui/Chip"
import { useRouter } from "next/navigation"
import { Kbd, clx } from "@medusajs/ui"
import { ArrowUpRightMini, Clock, MagnifyingGlass, XMarkMini } from "@medusajs/icons"
import { PartGlassGlyph } from "@/components/catalog/PartIcon"
import type { SearchHit, searchStarters } from "@/lib/public"
import { routes } from "@/lib/routes"

const KIND_LABEL = { model: "Device", part: "Part", category: "Category" } as const
const RECENT_KEY = "ig_recent_searches"

type Starters = ReturnType<typeof searchStarters>

// Recent searches live in this browser only (a convenience, never required)
function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]").slice(0, 4)
  } catch {
    return []
  }
}
function saveRecent(q: string) {
  try {
    const next = [q, ...readRecent().filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 4)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {}
}

// Bold the part of a suggestion that matches what was typed, only where a
// word starts with it (so "g" marks Galaxy, not the g inside Samsung)
export function Highlight({ text, q }: { text: string; q: string }) {
  const needle = q.trim()
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const m = needle ? new RegExp(`(^|[^\\p{L}\\p{N}])(${escaped})`, "iu").exec(text) : null
  const i = m ? m.index + m[1].length : -1
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-semibold text-ui-fg-interactive">{text.slice(i, i + needle.length)}</mark>
      {text.slice(i + needle.length)}
    </>
  )
}

// Typeahead over names, model codes and SKUs. "/" focuses it from anywhere.
// Empty, it suggests where to start; from the first letter, it suggests
// matches, best (starts with) first, with the matching letters in bold.
export function SearchBox({ className, starters }: { className?: string; starters: Starters }) {
  const router = useRouter()
  const listId = useId()
  const input = useRef<HTMLInputElement>(null)
  const [q, setQ] = useState("")
  const [hits, setHits] = useState<SearchHit[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [recent, setRecent] = useState<string[]>([])

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
    if (!q.trim()) {
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
    }, 90)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [q])

  const go = (href: string, remember?: string) => {
    if (remember?.trim()) saveRecent(remember.trim())
    setOpen(false)
    input.current?.blur()
    router.push(href)
  }
  const searchFor = (text: string) => go(routes.search(text), text)

  const empty = !q.trim()
  const showList = open && !empty && hits.length > 0
  const showNone = open && !empty && q.trim().length >= 2 && hits.length === 0

  return (
    <form
      role="search"
      className={clx("relative", className)}
      onSubmit={(e) => {
        e.preventDefault()
        if (active >= 0 && hits[active]) go(hits[active].href, q)
        else if (q.trim()) searchFor(q.trim())
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
          onFocus={() => {
            setRecent(readRecent())
            setOpen(true)
          }}
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
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          className="h-full min-w-0 flex-1 bg-transparent txt-compact-small text-ui-fg-base placeholder:text-ui-fg-muted outline-none"
        />
        {q && (
          <button
            type="button"
            aria-label="Clear search"
            onMouseDown={(e) => {
              e.preventDefault()
              setQ("")
              input.current?.focus()
            }}
            className="grid size-6 place-items-center rounded-full text-ui-fg-muted hover:bg-ui-bg-base-hover hover:text-ui-fg-base"
          >
            <XMarkMini />
          </button>
        )}
        <Kbd className="hidden sm:inline-flex">/</Kbd>
      </label>

      {/* Before typing: where to start */}
      {open && empty && (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-50 flex flex-col gap-4 rounded-2xl bg-ui-bg-base p-4 shadow-elevation-flyout">
          {recent.length > 0 && (
            <Section title="Recent">
              <div className="flex flex-wrap gap-1.5">
                {recent.map((r) => (
                  <Chip key={r} onPick={() => searchFor(r)} icon={<Clock />}>{r}</Chip>
                ))}
              </div>
            </Section>
          )}
          <Section title="Try">
            <div className="flex flex-wrap gap-1.5">
              {starters.queries.map((s) => (
                <Chip key={s} onPick={() => searchFor(s)} icon={<MagnifyingGlass />}>{s}</Chip>
              ))}
            </div>
          </Section>
          <Section title="Parts">
            <div className="flex flex-wrap gap-1.5">
              {starters.categories.map((c) => (
                <Chip key={c.slug} onPick={() => go(c.href)} icon={<PartGlassGlyph category={c.slug} className="size-4" />}>{c.title}</Chip>
              ))}
            </div>
          </Section>
          <Section title="Devices">
            <ul className="grid gap-1 sm:grid-cols-2">
              {starters.models.map((m) => (
                <li key={m.href}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      go(m.href)
                    }}
                    className="group flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-ui-bg-base-hover"
                  >
                    <span className="txt-compact-small-plus text-ui-fg-base">{m.title}</span>
                    <span className="flex items-center gap-1 txt-compact-xsmall text-ui-fg-muted">
                      {m.detail}
                      <ArrowUpRightMini className="opacity-0 transition-opacity group-hover:opacity-100" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      )}

      {/* While typing: matches, best first */}
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="ig-no-scrollbar absolute inset-x-0 top-[calc(100%+6px)] z-50 max-h-[420px] overflow-auto rounded-2xl bg-ui-bg-base p-1.5 shadow-elevation-flyout"
        >
          {hits.map((h, i) => (
            <li
              key={h.href}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault()
                go(h.href, q)
              }}
              onMouseEnter={() => setActive(i)}
              className={clx("flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2", i === active && "bg-ui-bg-base-hover")}
            >
              <span className="w-16 shrink-0 txt-compact-xsmall text-ui-fg-muted">{KIND_LABEL[h.kind]}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate txt-compact-small text-ui-fg-base"><Highlight text={h.title} q={q} /></span>
                <span className="ig-figure block truncate txt-compact-xsmall text-ui-fg-subtle"><Highlight text={h.detail} q={q} /></span>
              </span>
            </li>
          ))}
          <li
            role="option"
            aria-selected={false}
            onMouseDown={(e) => {
              e.preventDefault()
              searchFor(q.trim())
            }}
            className="mt-1 flex cursor-pointer items-center gap-2 rounded-lg border-t border-ui-border-base px-3 py-2 txt-compact-small text-ui-fg-interactive hover:bg-ui-bg-base-hover"
          >
            <MagnifyingGlass /> See all results for “{q.trim()}”
          </li>
        </ul>
      )}
      {showNone && (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-50 rounded-2xl bg-ui-bg-base p-4 shadow-elevation-flyout txt-compact-small text-ui-fg-subtle">
          No matches for “{q.trim()}”. Try a model name, a code from the back of the handset, or a SKU.
        </div>
      )}
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="txt-compact-xsmall-plus uppercase tracking-[0.06em] text-ui-fg-muted">{title}</p>
      {children}
    </div>
  )
}

function Chip({ children, icon, onPick }: { children: React.ReactNode; icon: React.ReactNode; onPick: () => void }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        onPick()
      }}
      className={clx(chipClass(), "[&_svg]:text-ui-fg-muted")}
    >
      {icon}
      {children}
    </button>
  )
}
