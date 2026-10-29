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

// How well a name matches what was typed: 0 starts with it, 1 a word in it
// starts with it, 2 contains it, -1 no match. From the first letter on,
// only starts-with matches count; containing needs two letters or more.
function rank(name: string, query: string) {
  const q = norm(query)
  if (!q) return -1
  if (norm(name).startsWith(q)) return 0
  const first = query.trim().toLowerCase().split(/\s+/)[0]
  if (name.toLowerCase().split(/[\s,()\-]+/).some((w) => w.startsWith(first)) && norm(name).includes(q)) return 1
  if (q.length >= 2 && norm(name).includes(q)) return 2
  return -1
}

// Matches names, pasted model codes (A3526, SM-S938B) and pasted SKUs (CAT-06),
// from the first letter typed. Best matches (starts with) come first.
export function searchCatalog(query: string, limit = 8): SearchHit[] {
  const q = norm(query)
  if (!q) return []
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  const byRank = <T,>(list: { r: number; hit: T }[]) => list.filter((x) => x.r >= 0).sort((a, b) => a.r - b.r).map((x) => x.hit)

  const models = byRank(
    allModels().map(({ brand, series, model }) => {
      // Best of: the name, a model code it starts with, a code it contains (3+ characters)
      const ranks = [
        rank(model.name, query),
        model.codes.some((c) => norm(c).startsWith(q)) ? 0 : -1,
        q.length >= 3 && model.codes.some((c) => norm(c).includes(q)) ? 2 : -1,
      ].filter((n) => n >= 0)
      return {
        r: ranks.length ? Math.min(...ranks) : -1,
        hit: { kind: "model" as const, title: model.name, detail: `${brand.name} · ${model.codes.join(" · ")}`, href: routes.model(brand.slug, series.slug, model.slug) },
      }
    })
  )

  const categories = byRank(
    CATEGORIES.map((c) => ({ r: rank(c.plural, query), hit: { kind: "category" as const, title: c.plural, detail: "Category", href: routes.category(c.slug) } }))
  )

  // Parts only once there is something to narrow by (two letters), or a SKU
  const parts =
    q.length < 2
      ? []
      : byRank(
          PRODUCTS.map((p) => ({
            r: norm(p.sku).startsWith(q) ? 0 : words.every((w) => p.name.toLowerCase().includes(w)) ? Math.max(1, rank(p.name, query)) : norm(p.sku).includes(q) ? 2 : -1,
            hit: {
              kind: "part" as const,
              title: p.name,
              detail: [p.sku, p.grade ? gradeById(p.grade).label : null].filter(Boolean).join(" · "),
              href: routes.product(p.slug),
            },
          }))
        )

  return [...models.slice(0, 4), ...categories.slice(0, 2), ...parts].slice(0, limit)
}

// What the search box shows before anything is typed: shortcuts into the
// catalogue (part categories and a few current models).
export function searchStarters() {
  const featured = ["iphone-17-pro-max", "iphone-16-pro", "galaxy-s25-ultra", "pixel-9-pro"]
  return {
    categories: CATEGORIES.map((c) => ({ slug: c.slug, title: c.plural, href: routes.category(c.slug) })),
    models: allModels()
      .filter(({ model }) => featured.includes(model.slug))
      .map(({ brand, series, model }) => ({ title: model.name, detail: brand.name, href: routes.model(brand.slug, series.slug, model.slug) })),
    queries: ["iPhone 17 Pro Max screen", "Galaxy S25 Ultra battery", "Service pack", "Soft OLED", "Charging port"],
  }
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
