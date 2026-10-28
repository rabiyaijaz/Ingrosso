import { BRANDS, CATEGORIES, PRODUCTS, allModels, gradeById } from "./catalog"
import { routes } from "./routes"

// Public-half shapes safe to send to the browser: no price, no stock (R1).

export type DeviceTree = {
  slug: string
  name: string
  series: { slug: string; name: string; models: { slug: string; name: string; codes: string[]; parts: number }[] }[]
}[]

export function deviceTree(): DeviceTree {
  return BRANDS.map((b) => ({
    slug: b.slug,
    name: b.name,
    series: b.series.map((s) => ({
      slug: s.slug,
      name: s.name,
      models: s.models.map((m) => ({ ...m, parts: PRODUCTS.filter((p) => p.models.includes(m.slug)).length })),
    })),
  }))
}

export type SearchHit = { kind: "model" | "part" | "category"; title: string; detail: string; href: string }

const norm = (s: string) => s.toLowerCase().replace(/[\s\-_]/g, "")

// Matches names, pasted model codes (A3526, SM-S938B) and pasted SKUs (CAT-06).
export function searchCatalog(query: string, limit = 8): SearchHit[] {
  const q = norm(query)
  if (q.length < 2) return []
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)

  const models: SearchHit[] = allModels()
    .filter(({ model }) => norm(model.name).includes(q) || model.codes.some((c) => norm(c).includes(q)))
    .map(({ brand, series, model }) => ({
      kind: "model",
      title: model.name,
      detail: model.codes.join(" · "),
      href: routes.model(brand.slug, series.slug, model.slug),
    }))

  const categories: SearchHit[] = CATEGORIES.filter((c) => norm(c.plural).includes(q)).map((c) => ({
    kind: "category",
    title: c.plural,
    detail: "Category",
    href: routes.category(c.slug),
  }))

  const parts: SearchHit[] = PRODUCTS.filter(
    (p) => norm(p.sku).includes(q) || words.every((w) => p.name.toLowerCase().includes(w))
  ).map((p) => ({
    kind: "part",
    title: p.name,
    detail: [p.sku, p.grade ? gradeById(p.grade).label : null].filter(Boolean).join(" · "),
    href: routes.product(p.slug),
  }))

  return [...models.slice(0, 4), ...categories.slice(0, 2), ...parts].slice(0, limit)
}

export function searchProducts(query: string) {
  const q = norm(query)
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (q.length < 2) return []
  const modelHits = new Set(
    allModels()
      .filter(({ model }) => norm(model.name).includes(q) || model.codes.some((c) => norm(c) === q))
      .map(({ model }) => model.slug)
  )
  return PRODUCTS.filter(
    (p) =>
      norm(p.sku).includes(q) ||
      words.every((w) => p.name.toLowerCase().includes(w)) ||
      p.models.some((m) => modelHits.has(m))
  )
}
