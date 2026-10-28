import { Text } from "@medusajs/ui"
import { BRANDS, CATEGORIES, findModel, type Product } from "@/lib/catalog"
import type { Viewer } from "@/lib/viewer"
import { Figure } from "@/components/commerce/Figure"
import { FacetGroup, GradeFilterBar, applyFacets, type FacetParams } from "./Facets"
import { ProductTable } from "./ProductTable"

type Props = {
  products: Product[]
  viewer: Viewer
  params: FacetParams
  hrefFor: (p: FacetParams) => string
  facets: ("cat" | "brand")[]
  groupByCategory?: boolean
}

// One listing layout for device, category and search results.
export function ListingView({ products, viewer, params, hrefFor, facets, groupByCategory }: Props) {
  // Facet counts come from the set before the facet's own filter is applied.
  const visible = applyFacets(products, params)
  const forCats = applyFacets(products, { ...params, cat: undefined })
  const forBrands = applyFacets(products, { ...params, brand: undefined })

  const catOptions = CATEGORIES.map((c) => ({
    value: c.slug,
    label: c.plural,
    count: forCats.filter((p) => p.category === c.slug).length,
  })).filter((o) => o.count)

  const brandOptions = BRANDS.map((b) => ({
    value: b.slug,
    label: b.name,
    count: forBrands.filter((p) => p.models.some((m) => findModel(m)?.brand.slug === b.slug)).length,
  })).filter((o) => o.count)

  return (
    <div className="flex flex-col gap-6">
      <GradeFilterBar products={applyFacets(products, { ...params, grade: undefined })} params={params} hrefFor={hrefFor} />
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="flex flex-col gap-8 lg:sticky lg:top-6 lg:self-start">
          {facets.includes("cat") && <FacetGroup title="Part" options={catOptions} paramKey="cat" params={params} hrefFor={hrefFor} />}
          {facets.includes("brand") && <FacetGroup title="Brand" options={brandOptions} paramKey="brand" params={params} hrefFor={hrefFor} />}
        </aside>
        <div className="flex min-w-0 flex-col gap-4">
          <Text size="small" className="text-ui-fg-subtle">
            <Figure>{visible.length}</Figure> of <Figure>{products.length}</Figure> parts
          </Text>
          <ProductTable products={visible} viewer={viewer} groupByCategory={groupByCategory} />
        </div>
      </div>
    </div>
  )
}
