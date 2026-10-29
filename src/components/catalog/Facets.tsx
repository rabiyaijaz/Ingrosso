import Link from "next/link"
import { clx } from "@medusajs/ui"
import { CheckMini, XMark } from "@medusajs/icons"
import { GRADES, findModel, type GradeId, type Product } from "@/lib/catalog"
import { Figure } from "@/components/commerce/Figure"
import { searchProducts } from "@/lib/public"
import { FAMILIES, GradeIcon } from "./Grade"

// Filters live in the URL so a filtered view can be shared and bookmarked (BRD 3.2).
export type FacetParams = Record<string, string | undefined>

export const toggle = (params: FacetParams, key: string, value: string) => {
  const current = new Set((params[key] ?? "").split(",").filter(Boolean))
  if (current.has(value)) current.delete(value)
  else current.add(value)
  return { ...params, [key]: current.size ? [...current].join(",") : undefined }
}

export const selected = (params: FacetParams, key: string) => new Set((params[key] ?? "").split(",").filter(Boolean))

// Model filters live under their brand: when a brand is unticked, its models go too.
export const pruneModels = (params: FacetParams): FacetParams => {
  const brands = selected(params, "brand")
  const kept = [...selected(params, "model")].filter((m) => brands.has(findModel(m)?.brand.slug ?? ""))
  return { ...params, model: kept.length ? kept.join(",") : undefined }
}

// Grade is the primary filter on every listing (CAT-03): grade chips above
// the results, grouped Genuine / Aftermarket / Third-party, each with its icon.
export function GradeFilterBar({
  products,
  params,
  hrefFor,
}: {
  products: Product[]
  params: FacetParams
  hrefFor: (p: FacetParams) => string
}) {
  const active = selected(params, "grade")
  const present = GRADES.filter((g) => products.some((p) => p.grade === g.id))
  if (!present.length) return null
  return (
    <div role="group" aria-label="Filter by grade" className="flex flex-wrap items-start gap-x-6 gap-y-3">
      {FAMILIES.map((family) => {
        const grades = present.filter((g) => g.family === family)
        if (!grades.length) return null
        return (
          <div key={family} role="group" aria-label={family} className="flex flex-col gap-1.5">
            <span className="txt-compact-xsmall-plus text-ui-fg-muted">{family}</span>
            <div className="flex flex-wrap gap-2">
              {grades.map((g) => {
                const on = active.has(g.id)
                const count = products.filter((p) => p.grade === g.id).length
                return (
                  <Link
                    key={g.id}
                    href={hrefFor(toggle(params, "grade", g.id))}
                    aria-pressed={on}
                    scroll={false}
                    className={clx(
                      "inline-flex h-9 items-center gap-2 rounded-full pl-3 pr-3.5 txt-compact-small-plus transition-colors outline-none focus-visible:shadow-borders-focus",
                      on ? "bg-ig-blue text-ig-on-accent" : "bg-ui-bg-subtle text-ui-fg-base hover:bg-ui-bg-subtle-hover"
                    )}
                  >
                    <GradeIcon grade={g.id} bare />
                    {g.label}
                    <Figure className={clx("txt-compact-xsmall", on ? "opacity-70" : "text-ui-fg-muted")}>{count}</Figure>
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}
      {active.size > 0 && (
        <Link href={hrefFor({ ...params, grade: undefined })} scroll={false} className="inline-flex h-9 items-center gap-1 self-end rounded-full px-3 txt-compact-small text-ui-fg-interactive hover:bg-ui-bg-highlight">
          <XMark /> All grades
        </Link>
      )}
    </div>
  )
}

export function FacetGroup({
  title,
  options,
  paramKey,
  params,
  hrefFor,
}: {
  title: string
  options: { value: string; label: string; count: number }[]
  paramKey: string
  params: FacetParams
  hrefFor: (p: FacetParams) => string
}) {
  const active = selected(params, paramKey)
  if (!options.length) return null
  return (
    <fieldset className="flex flex-col gap-0.5">
      <legend className="mb-2 txt-compact-small-plus text-ui-fg-base">{title}</legend>
      {options.map((o) => {
        const on = active.has(o.value)
        return (
          <Link
            key={o.value}
            href={hrefFor(toggle(params, paramKey, o.value))}
            aria-pressed={on}
            scroll={false}
            className="group -mx-2 flex h-8 items-center gap-2.5 rounded-md px-2 txt-compact-small text-ui-fg-subtle hover:bg-ui-bg-base-hover hover:text-ui-fg-base outline-none focus-visible:shadow-borders-focus"
          >
            <span
              aria-hidden
              className={clx(
                "grid size-4 place-items-center rounded-[4px]",
                on ? "bg-ui-bg-interactive text-ui-fg-on-color" : "bg-ui-bg-base shadow-borders-base"
              )}
            >
              {on && <CheckMini />}
            </span>
            <span className={clx("flex-1", on && "text-ui-fg-base")}>{o.label}</span>
            <Figure className="txt-compact-xsmall text-ui-fg-muted">{o.count}</Figure>
          </Link>
        )
      })}
    </fieldset>
  )
}

export function applyFacets(products: Product[], params: FacetParams) {
  const grades = selected(params, "grade") as Set<GradeId>
  const cats = selected(params, "cat")
  const brands = selected(params, "brand")
  const models = selected(params, "model")
  const fam = params.fam
  // Search within the list: the same matching as the header search (name, SKU, model name or code)
  const found = params.find ? new Set(searchProducts(params.find).map((p) => p.slug)) : null
  return products.filter(
    (p) =>
      (!found || found.has(p.slug)) &&
      (!models.size || p.models.some((m) => models.has(m))) &&
      (!grades.size || (p.grade && grades.has(p.grade))) &&
      (!fam || (p.grade && GRADES.find((g) => g.id === p.grade)?.family === fam)) &&
      (!cats.size || cats.has(p.category)) &&
      (!brands.size || p.models.some((m) => brands.has(findModel(m)?.brand.slug ?? "")))
  )
}
