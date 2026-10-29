import { BRANDS, CATEGORIES, GRADES, findModel, type Grade, type Product } from "@/lib/catalog"
import { commercialView } from "@/lib/commerce"
import type { Viewer } from "@/lib/viewer"
import { applyFacets, pruneModels, selected, type FacetParams } from "../Facets"

// Facet options, filtering and sorting shared by every listing layout.

export type Option = { value: string; label: string; count: number }
export type GradeOption = Option & { family: Grade["family"] }

export const canSeeStock = (v: Viewer) => v.state === "approved" || v.state === "masked"

// Each facet counts against the set filtered by every *other* facet, so a
// count always says what you would get by ticking that option.
export function buildFacets(products: Product[], params: FacetParams, viewer: Viewer) {
  const without = (key: string) => filterProducts(products, { ...params, [key]: undefined }, viewer)
  const forGrade = without("grade")
  const forCat = without("cat")
  // Brand counts ignore the model ticks too, or other brands would read 0
  const forBrand = filterProducts(products, { ...params, brand: undefined, model: undefined }, viewer)
  const forStock = without("stock")

  const grades: GradeOption[] = GRADES.map((g) => ({
    value: g.id,
    label: g.label,
    family: g.family,
    count: forGrade.filter((p) => p.grade === g.id).length,
  })).filter((o) => o.count)

  const cats: Option[] = CATEGORIES.map((c) => ({ value: c.slug, label: c.plural, count: forCat.filter((p) => p.category === c.slug).length })).filter(
    (o) => o.count
  )

  const brands: Option[] = BRANDS.map((b) => ({
    value: b.slug,
    label: b.name,
    count: forBrand.filter((p) => p.models.some((m) => findModel(m)?.brand.slug === b.slug)).length,
  })).filter((o) => o.count)

  const inStock = canSeeStock(viewer) ? forStock.filter((p) => commercialView(p, viewer).stock.kind === "count").length : null

  // Progressive: each ticked brand opens its models, grouped by series
  const forModel = without("model")
  const models: Record<string, ModelGroup[]> = {}
  for (const slug of selected(params, "brand")) {
    const brand = BRANDS.find((b) => b.slug === slug)
    if (!brand) continue
    models[slug] = brand.series
      .map((s) => ({
        series: s.name,
        options: s.models
          .map((m) => ({ value: m.slug, label: m.name, count: forModel.filter((p) => p.models.includes(m.slug)).length }))
          .filter((o) => o.count),
      }))
      .filter((g) => g.options.length)
  }

  // Suggestions for "search within these parts": the models and SKUs in the
  // list as it stands without the search itself
  const forFind = without("find")
  const modelCount = new Map<string, number>()
  forFind.forEach((p) => p.models.forEach((m) => modelCount.set(m, (modelCount.get(m) ?? 0) + 1)))
  const findOptions: FindOption[] = [
    ...[...modelCount.entries()]
      .map(([slug, count]) => ({ ref: findModel(slug), count }))
      .filter((x) => x.ref)
      .sort((a, b) => b.count - a.count)
      .map(({ ref, count }) => ({ value: ref!.model.name, label: ref!.model.name, detail: `${ref!.model.codes.join(" · ")} · ${count} part${count === 1 ? "" : "s"}`, kind: "model" as const })),
    ...forFind.map((p) => ({ value: p.sku, label: p.sku, detail: p.name, kind: "sku" as const })),
  ]

  return { grades, cats, brands, models, inStock, findOptions }
}

export type FindOption = { value: string; label: string; detail: string; kind: "model" | "sku" }

export type ModelGroup = { series: string; options: Option[] }

// Stock filtering reads stock through the price gate, and only for viewers
// who may see stock (R2, R7).
export function filterProducts(products: Product[], params: FacetParams, viewer: Viewer) {
  let out = applyFacets(products, params)
  if (params.stock === "in" && canSeeStock(viewer)) out = out.filter((p) => commercialView(p, viewer).stock.kind === "count")
  return out
}

export const SORTS = [
  { value: "", label: "Best match" },
  { value: "grade", label: "Grade: genuine first" },
  { value: "name", label: "Name A–Z" },
] as const

// No price sort: prices are resolved after filtering and paging (CAT-12, R8).
export function sortProducts(products: Product[], sort: string | undefined) {
  if (sort === "name") return [...products].sort((a, b) => a.name.localeCompare(b.name))
  if (sort === "grade") {
    const rank = (p: Product) => (p.grade ? GRADES.find((g) => g.id === p.grade)!.rank : 99)
    return [...products].sort((a, b) => rank(a) - rank(b))
  }
  return products
}

// Every active filter as a removable chip.
export function activeFilters(params: FacetParams) {
  const chips: { key: string; label: string; remove: FacetParams }[] = []
  const drop = (key: string, value: string) => {
    const rest = [...selected(params, key)].filter((v) => v !== value)
    return { ...params, [key]: rest.length ? rest.join(",") : undefined }
  }
  if (params.find) chips.push({ key: "find", label: `“${params.find}”`, remove: { ...params, find: undefined } })
  if (params.fam) chips.push({ key: `fam`, label: params.fam, remove: { ...params, fam: undefined } })
  selected(params, "grade").forEach((v) => chips.push({ key: `grade-${v}`, label: GRADES.find((g) => g.id === v)?.label ?? v, remove: drop("grade", v) }))
  selected(params, "brand").forEach((v) => chips.push({ key: `brand-${v}`, label: BRANDS.find((b) => b.slug === v)?.name ?? v, remove: pruneModels(drop("brand", v)) }))
  selected(params, "model").forEach((v) => chips.push({ key: `model-${v}`, label: findModel(v)?.model.name ?? v, remove: drop("model", v) }))
  selected(params, "cat").forEach((v) => chips.push({ key: `cat-${v}`, label: CATEGORIES.find((c) => c.slug === v)?.plural ?? v, remove: drop("cat", v) }))
  if (params.stock === "in") chips.push({ key: "stock", label: "In stock", remove: { ...params, stock: undefined } })
  return chips
}

// Clears the filters; keeps how the results are shown (sort, list or cards)
export const clearAll = (params: FacetParams): FacetParams => ({ sort: params.sort, view: params.view })
