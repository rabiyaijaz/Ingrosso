import Link from "next/link"
import { Text, clx } from "@medusajs/ui"
import { CheckMini } from "@medusajs/icons"
import { BrandMark } from "@/components/brand/BrandMark"
import { BRANDS, CATEGORIES, findModel, type Product } from "@/lib/catalog"
import { getListingVariant } from "@/lib/listing"
import type { Viewer } from "@/lib/viewer"
import { Figure } from "@/components/commerce/Figure"
import { FacetGroup, GradeFilterBar, applyFacets, selected, type FacetParams } from "./Facets"
import { ProductTable } from "./ProductTable"
import { FilterDropdown } from "./listing/Client"
import { ActiveFilters, BrandChecks, CheckList, FamilyTabs, FindInList, FilterPanel, GradeChecks, ProductCards, ResultsBar } from "./listing/Pieces"
import { buildFacets, filterProducts, sortProducts } from "./listing/model"

type Props = {
  products: Product[]
  viewer: Viewer
  params: FacetParams
  hrefFor: (p: FacetParams) => string
  facets: ("cat" | "brand")[]
  groupByCategory?: boolean
}

// Part listings for device, category and search pages. The layout comes from
// getListingVariant(): the lab can preview each, the main app uses the default.
export async function ListingView(props: Props) {
  const variant = await getListingVariant()
  if (variant === "sidebar") return <SidebarLayout {...props} />
  if (variant === "topbar") return <TopbarLayout {...props} />
  if (variant === "tabs") return <TabsLayout {...props} />
  return <CurrentLayout {...props} />
}

// A · Filter sidebar + table: the industrial-supplier pattern (Grainger,
// McMaster-Carr, Digi-Key). Every filter in one sticky panel on the left.
function SidebarLayout({ products, viewer, params, hrefFor, facets, groupByCategory }: Props) {
  const f = buildFacets(products, params, viewer)
  const visible = sortProducts(filterProducts(products, params, viewer), params.sort)
  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <FilterPanel facets={f} params={params} hrefFor={hrefFor} show={["grade", ...facets, "stock"]} />
      <div className="flex min-w-0 flex-col gap-4">
        <ResultsBar shown={visible.length} total={products.length} params={params} hrefFor={hrefFor} />
        <ActiveFilters params={params} hrefFor={hrefFor} />
        <ProductTable products={visible} viewer={viewer} groupByCategory={groupByCategory && !params.sort} />
      </div>
    </div>
  )
}

// B · Top filter bar + cards: the marketplace pattern (Amazon Business).
// Filters are dropdown buttons above wide results; parts show as cards.
function TopbarLayout({ products, viewer, params, hrefFor, facets }: Props) {
  const f = buildFacets(products, params, viewer)
  const visible = sortProducts(filterProducts(products, params, viewer), params.sort)
  const stockOn = params.stock === "in"
  return (
    <div className="flex flex-col gap-5">
      {/* z-20: the dropdown panels must open above the result cards */}
      <div className="relative z-20 flex flex-wrap items-center gap-2.5 rounded-2xl bg-ui-bg-base p-3 shadow-elevation-card-rest">
        <FindInList params={params} hrefFor={hrefFor} options={f.findOptions} className="w-full sm:w-[220px]" />
        <span className="px-2 txt-compact-small-plus text-ui-fg-subtle">Filter by</span>
        {/* Same order as the filter panel: availability, brand, grade, part */}
        {f.inStock !== null && (
          <Link
            href={hrefFor({ ...params, stock: stockOn ? undefined : "in" })}
            aria-pressed={stockOn}
            scroll={false}
            className={clx("ig-btn", stockOn ? "ig-btn-primary" : "ig-btn-secondary")}
            data-variant={stockOn ? "primary" : "secondary"}
            data-size="md"
          >
            <span aria-hidden className="ig-btn__sheen" />
            <span aria-hidden className={clx("grid size-4 place-items-center rounded-[4px]", stockOn ? "bg-white/30" : "shadow-borders-base")}>
              {stockOn && <CheckMini />}
            </span>
            In stock only
          </Link>
        )}
        {facets.includes("brand") && f.brands.length > 1 && (
          <FilterDropdown label="Brand" count={selected(params, "brand").size + selected(params, "model").size}>
            <BrandChecks facets={f} params={params} hrefFor={hrefFor} />
          </FilterDropdown>
        )}
        <FilterDropdown label="Grade" count={selected(params, "grade").size}>
          <GradeChecks options={f.grades} params={params} hrefFor={hrefFor} />
        </FilterDropdown>
        {facets.includes("cat") && f.cats.length > 1 && (
          <FilterDropdown label="Part" count={selected(params, "cat").size}>
            <CheckList options={f.cats} paramKey="cat" params={params} hrefFor={hrefFor} />
          </FilterDropdown>
        )}
      </div>
      <ResultsBar shown={visible.length} total={products.length} params={params} hrefFor={hrefFor} />
      <ActiveFilters params={params} hrefFor={hrefFor} />
      <ProductCards products={visible} viewer={viewer} />
    </div>
  )
}

// C · Grade tabs: grade is the first decision (BRD CAT-03), so the grade
// families are large tabs over the results; the side panel narrows further.
function TabsLayout({ products, viewer, params, hrefFor, facets, groupByCategory }: Props) {
  const f = buildFacets(products, params, viewer)
  const visible = sortProducts(filterProducts(products, params, viewer), params.sort)
  const famGrades = params.fam ? { ...f, grades: f.grades.filter((g) => g.family === params.fam) } : f
  return (
    <div className="flex flex-col gap-6">
      <FamilyTabs products={filterProducts(products, { ...params, fam: undefined, grade: undefined }, viewer)} params={params} hrefFor={hrefFor} />
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <FilterPanel facets={famGrades} params={params} hrefFor={hrefFor} show={["grade", ...facets, "stock"]} />
        <div className="flex min-w-0 flex-col gap-4">
          <ResultsBar shown={visible.length} total={products.length} params={params} hrefFor={hrefFor} />
          <ActiveFilters params={params} hrefFor={hrefFor} />
          <ProductTable products={visible} viewer={viewer} groupByCategory={groupByCategory && !params.sort} />
        </div>
      </div>
    </div>
  )
}

// The layout before the variants: grade chips on top, small side facets.
function CurrentLayout({ products, viewer, params, hrefFor, facets, groupByCategory }: Props) {
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
