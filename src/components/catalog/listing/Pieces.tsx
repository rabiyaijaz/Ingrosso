import Link from "next/link"
import { Heading, clx } from "@medusajs/ui"
import { CheckMini, ChevronDown, MagnifyingGlass, XMark } from "@medusajs/icons"
import { BrandMark } from "@/components/brand/BrandMark"
import { AddToOrder } from "@/components/commerce/AddToOrder"
import { Figure } from "@/components/commerce/Figure"
import { PriceTag } from "@/components/commerce/PriceTag"
import { StockTag } from "@/components/commerce/StockTag"
import { CATEGORIES, GRADES, type Product } from "@/lib/catalog"
import { commercialView } from "@/lib/commerce"
import { routes } from "@/lib/routes"
import type { Viewer } from "@/lib/viewer"
import { pruneModels, selected, toggle, type FacetParams } from "../Facets"
import { FAMILIES, GradeBadge, GradeIcon } from "../Grade"
import { PartImage } from "../PartImage"
import { SortSelect } from "./Client"
import { SORTS, activeFilters, clearAll, type GradeOption, type Option, type buildFacets } from "./model"

type Href = (p: FacetParams) => string
type Facets = ReturnType<typeof buildFacets>

// ─── Check list: the clickable unit of every filter ─────────────────────────
// A real checkbox square, a hover row, the label and its count: the pattern
// shoppers already recognise as "tick to filter".
export function CheckList({
  options,
  paramKey,
  params,
  hrefFor,
  icon,
  nested,
}: {
  options: Option[]
  paramKey: string
  params: FacetParams
  hrefFor: Href
  icon?: (value: string) => React.ReactNode
  // Shown under a ticked option: the next, narrower choice (brand → models)
  nested?: (value: string) => React.ReactNode
}) {
  const active = selected(params, paramKey)
  return (
    <ul className="flex flex-col gap-0.5">
      {options.map((o) => {
        const on = active.has(o.value)
        return (
          <li key={o.value}>
            <Link
              href={hrefFor(toggle(params, paramKey, o.value))}
              aria-pressed={on}
              scroll={false}
              className={clx(
                "group flex min-h-9 items-center gap-2.5 rounded-lg px-2 txt-compact-small outline-none transition-colors focus-visible:shadow-borders-focus",
                on ? "bg-ui-bg-highlight text-ui-fg-base" : "text-ui-fg-subtle hover:bg-ui-bg-base-hover hover:text-ui-fg-base"
              )}
            >
              <span
                aria-hidden
                className={clx(
                  "grid size-[18px] shrink-0 place-items-center rounded-[5px] transition-colors",
                  on ? "bg-ig-blue text-ig-on-accent" : "bg-ui-bg-base shadow-borders-base group-hover:shadow-borders-interactive-with-active"
                )}
              >
                {on && <CheckMini />}
              </span>
              {icon?.(o.value)}
              <span className={clx("flex-1", on && "font-medium")}>{o.label}</span>
              <Figure className="txt-compact-xsmall text-ui-fg-muted">{o.count}</Figure>
            </Link>
            {on && nested?.(o.value)}
          </li>
        )
      })}
    </ul>
  )
}

export function GradeChecks({ options, params, hrefFor }: { options: GradeOption[]; params: FacetParams; hrefFor: Href }) {
  return (
    <div className="flex flex-col gap-3">
      {FAMILIES.map((f) => {
        const opts = options.filter((o) => o.family === f)
        if (!opts.length) return null
        return (
          <div key={f} className="flex flex-col gap-1">
            <span className="px-2 txt-compact-xsmall-plus text-ui-fg-muted">{f}</span>
            <CheckList options={opts} paramKey="grade" params={params} hrefFor={hrefFor} icon={(v) => <GradeIcon grade={v as never} bare />} />
          </div>
        )
      })}
    </div>
  )
}

// ─── Search within the list ─────────────────────────────────────────────────
// A plain GET form, so it works without JavaScript and the text stays in the
// URL with every other filter. Matches name, SKU, model name or model code.
export function FindInList({ params, hrefFor, className }: { params: FacetParams; hrefFor: Href; className?: string }) {
  const target = new URL(hrefFor({ ...params, find: undefined }), "http://x")
  return (
    <form action={target.pathname} method="get" role="search" className={clx("relative", className)}>
      {[...target.searchParams].map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <MagnifyingGlass aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-muted" />
      <input
        type="search"
        name="find"
        defaultValue={params.find ?? ""}
        aria-label="Search within these parts"
        placeholder="Model, code or SKU"
        className="h-9 w-full rounded-full bg-ui-bg-field pl-9 pr-3 txt-compact-small text-ui-fg-base shadow-borders-base outline-none transition-shadow placeholder:text-ui-fg-muted hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active"
      />
    </form>
  )
}

// Brands, each opening its models (grouped by series) once ticked. Unticking
// a brand also clears its models.
export function BrandChecks({ facets, params, hrefFor }: { facets: Facets; params: FacetParams; hrefFor: Href }) {
  return (
    <CheckList
      options={facets.brands}
      paramKey="brand"
      params={params}
      hrefFor={(p) => hrefFor(pruneModels(p))}
      icon={(v) => <BrandMark brand={v} variant="plain" />}
      nested={(brand) => {
        const groups = facets.models[brand] ?? []
        if (!groups.length) return null
        return (
          <div className="ml-[17px] mt-1 mb-2 flex flex-col gap-2 border-l border-ui-border-base pl-3">
            {groups.map((g) => (
              <div key={g.series} className="flex flex-col gap-0.5">
                <span className="px-2 txt-compact-xsmall-plus text-ui-fg-muted">{g.series}</span>
                <CheckList options={g.options} paramKey="model" params={params} hrefFor={hrefFor} />
              </div>
            ))}
          </div>
        )
      }}
    />
  )
}

export function StockToggle({ count, params, hrefFor }: { count: number; params: FacetParams; hrefFor: Href }) {
  const on = params.stock === "in"
  return (
    <CheckList
      options={[{ value: "in", label: "In stock only", count }]}
      paramKey="stock"
      params={params}
      hrefFor={(p) => hrefFor({ ...p, stock: on ? undefined : "in" })}
    />
  )
}

// ─── Filter panel (layouts A and C) ─────────────────────────────────────────
// Collapsible groups with a chevron; a "Filters" header with Clear all.
// On small screens the whole panel folds behind one "Filters" button.
export function FilterPanel({
  facets,
  params,
  hrefFor,
  show = ["stock", "brand", "grade", "cat"],
}: {
  facets: Facets
  params: FacetParams
  hrefFor: Href
  show?: ("grade" | "brand" | "cat" | "stock")[]
}) {
  const active = activeFilters(params).length
  const group = (title: string, body: React.ReactNode, open = true) => (
    <details open={open} className="group/g border-t border-ui-border-base py-3 first:border-t-0 first:pt-0">
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-1 txt-compact-small-plus text-ui-fg-base hover:bg-ui-bg-base-hover [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="text-ui-fg-muted transition-transform group-open/g:rotate-180" />
      </summary>
      <div className="mt-2">{body}</div>
    </details>
  )
  // Fixed order in every layout: the one-click stock switch, then the
  // narrowing order a repairer thinks in (brand → grade → part).
  const panel = (
    <div className="flex flex-col">
      {show.includes("stock") && facets.inStock !== null && group("Availability", <StockToggle count={facets.inStock} params={params} hrefFor={hrefFor} />)}
      {show.includes("brand") && facets.brands.length > 1 &&
        group("Brand", <BrandChecks facets={facets} params={params} hrefFor={hrefFor} />)}
      {show.includes("grade") && facets.grades.length > 0 && group("Grade", <GradeChecks options={facets.grades} params={params} hrefFor={hrefFor} />)}
      {show.includes("cat") && facets.cats.length > 1 && group("Part", <CheckList options={facets.cats} paramKey="cat" params={params} hrefFor={hrefFor} />)}
    </div>
  )
  return (
    <aside aria-label="Filters" className="lg:sticky lg:top-4 lg:self-start">
      <details className="group/m rounded-2xl bg-ui-bg-base p-4 shadow-elevation-card-rest lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between txt-compact-medium-plus [&::-webkit-details-marker]:hidden">
          Filters{active ? ` (${active})` : ""}
          <ChevronDown className="transition-transform group-open/m:rotate-180" />
        </summary>
        <div className="mt-4 flex flex-col gap-3">
          <FindInList params={params} hrefFor={hrefFor} />
          {panel}
        </div>
      </details>
      {/* Never taller than the screen while sticky. The heading and search stay
          put; only the filter groups below them scroll, with no scrollbar. */}
      <div className="hidden max-h-[calc(100svh-2rem)] flex-col rounded-2xl bg-ui-bg-base shadow-elevation-card-rest lg:flex">
        <div className="flex flex-col gap-3 border-b border-ui-border-base p-4 pb-3">
          <div className="flex items-center justify-between px-2">
            <Heading level="h2" className="txt-compact-medium-plus">Filters</Heading>
            {active > 0 && (
              <Link href={hrefFor(clearAll(params))} scroll={false} className="txt-compact-small text-ui-fg-interactive hover:underline">
                Clear all
              </Link>
            )}
          </div>
          <FindInList params={params} hrefFor={hrefFor} />
        </div>
        <div className="ig-scroll-quiet min-h-0 flex-1 p-4 pt-3">{panel}</div>
      </div>
    </aside>
  )
}

// ─── Applied filters ────────────────────────────────────────────────────────
export function ActiveFilters({ params, hrefFor }: { params: FacetParams; hrefFor: Href }) {
  const chips = activeFilters(params)
  if (!chips.length) return null
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Applied filters">
      {chips.map((c) => (
        <Link
          key={c.key}
          href={hrefFor(c.remove)}
          scroll={false}
          aria-label={`Remove filter ${c.label}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ui-bg-highlight pl-3 pr-2 txt-compact-small-plus text-ui-fg-interactive transition-colors hover:bg-ui-bg-highlight-hover"
        >
          {c.label}
          <XMark className="size-3.5" />
        </Link>
      ))}
      <Link href={hrefFor(clearAll(params))} scroll={false} className="px-2 txt-compact-small text-ui-fg-subtle underline-offset-2 hover:text-ui-fg-base hover:underline">
        Clear all
      </Link>
    </div>
  )
}

// ─── Results bar: count + sort ──────────────────────────────────────────────
export function ResultsBar({ shown, total, params, hrefFor }: { shown: number; total: number; params: FacetParams; hrefFor: Href }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="txt-compact-medium text-ui-fg-subtle">
        <Figure className="font-medium text-ui-fg-base">{shown}</Figure> of <Figure>{total}</Figure> parts
      </p>
      <SortSelect value={params.sort ?? ""} options={SORTS.map((s) => ({ ...s, href: hrefFor({ ...params, sort: s.value || undefined }) }))} />
    </div>
  )
}

// ─── Grade family tabs (layout C) ───────────────────────────────────────────
export function FamilyTabs({ products, params, hrefFor }: { products: Product[]; params: FacetParams; hrefFor: Href }) {
  const count = (f?: string) => products.filter((p) => !f || GRADES.find((g) => g.id === p.grade)?.family === f).length
  const tabs = [{ id: undefined as string | undefined, label: "All grades" }, ...FAMILIES.map((f) => ({ id: f as string | undefined, label: f }))]
  return (
    <nav aria-label="Grade family" className="grid grid-cols-2 gap-2 rounded-2xl bg-ui-bg-subtle p-1.5 sm:grid-cols-4">
      {tabs.map((t) => {
        const on = (params.fam ?? undefined) === t.id
        const n = count(t.id)
        return (
          <Link
            key={t.label}
            href={hrefFor({ ...params, fam: t.id, grade: undefined })}
            aria-current={on ? "page" : undefined}
            scroll={false}
            className={clx(
              "flex flex-col items-start gap-0.5 rounded-xl px-4 py-3 outline-none transition-colors focus-visible:shadow-borders-focus",
              on ? "bg-ig-blue text-ig-on-accent shadow-[0_8px_20px_-10px_var(--ig-blue)]" : "text-ui-fg-base hover:bg-ui-bg-base",
              !n && "pointer-events-none opacity-40"
            )}
          >
            <span className="txt-compact-medium-plus">{t.label}</span>
            <Figure className={clx("txt-compact-small", on ? "opacity-80" : "text-ui-fg-muted")}>{n} parts</Figure>
          </Link>
        )
      })}
    </nav>
  )
}

// ─── Product cards (layout B) ───────────────────────────────────────────────
export function ProductCards({ products, viewer }: { products: Product[]; viewer: Viewer }) {
  if (!products.length) {
    return (
      <div className="rounded-2xl bg-ui-bg-subtle px-6 py-12 text-center">
        <p className="txt-medium-plus">No parts match these filters</p>
        <p className="mt-1 txt-small text-ui-fg-subtle">Remove a filter to see more.</p>
      </div>
    )
  }
  const canOrder = viewer.state === "approved" || viewer.state === "masked"
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((p) => {
        const view = commercialView(p, viewer)
        const cat = CATEGORIES.find((c) => c.slug === p.category)
        return (
          <li key={p.slug} className="flex flex-col overflow-hidden rounded-2xl bg-ui-bg-base shadow-elevation-card-rest transition-shadow hover:shadow-elevation-card-hover">
            <Link href={routes.product(p.slug)} className="group flex flex-1 flex-col outline-none focus-visible:shadow-borders-focus">
              <span className="relative grid aspect-[16/10] place-items-center bg-ui-bg-subtle">
                <PartImage product={p} size={128} className="size-32 transition-transform duration-300 group-hover:scale-105" />
                {p.grade && <GradeBadge grade={p.grade} className="absolute left-3 top-3" />}
              </span>
              <span className="flex flex-1 flex-col gap-1 p-4">
                <span className="txt-compact-xsmall text-ui-fg-muted">{cat?.name}</span>
                <span className="txt-compact-medium-plus text-ui-fg-base group-hover:text-ui-fg-interactive">{p.name}</span>
                <Figure className="txt-compact-xsmall text-ui-fg-muted">{p.sku}</Figure>
              </span>
            </Link>
            <div className="flex items-end justify-between gap-3 px-4 pb-3">
              <PriceTag view={view.price} />
              <StockTag view={view.stock} />
            </div>
            {canOrder && view.stock.kind !== "out" && (
              <div className="border-t border-ui-border-base px-4 py-3">
                <AddToOrder
                  variant="row"
                  slug={p.slug}
                  name={p.name}
                  orderStep={view.orderStep}
                  breaks={view.price.kind === "priced" ? view.price.breaks : null}
                  maxAvailable={view.stock.kind === "count" ? view.stock.available : null}
                />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
