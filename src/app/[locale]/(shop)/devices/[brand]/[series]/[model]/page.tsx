import Link from "next/link"
import { notFound } from "next/navigation"
import { clx } from "@medusajs/ui"
import { ListingView } from "@/components/catalog/ListingView"
import { Breadcrumbs, PageContainer, PageHeading } from "@/components/layout/Page"
import { BrandMark } from "@/components/brand/BrandMark"
import { Figure } from "@/components/commerce/Figure"
import { findModel, productsForModel } from "@/lib/catalog"
import { routes } from "@/lib/routes"
import { getViewer } from "@/lib/viewer"

type Params = { locale: string; brand: string; series: string; model: string }

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const ref = findModel((await params).model)
  return { title: ref ? `${ref.model.name} parts` : "Parts" }
}

export default async function ModelPage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<Record<string, string>> }) {
  const p = await params
  const sp = await searchParams
  const ref = findModel(p.model)
  if (!ref || ref.brand.slug !== p.brand || ref.series.slug !== p.series) notFound()
  const viewer = await getViewer()
  const { brand, series, model } = ref
  const facetParams = { grade: sp.grade, cat: sp.cat, fam: sp.fam, stock: sp.stock, sort: sp.sort }

  return (
    <PageContainer className="flex flex-col gap-8 pt-6">
      <Breadcrumbs
        items={[
          { label: "Devices", href: routes.devices() },
          { label: brand.name, href: routes.brand(brand.slug) },
          { label: series.name, href: routes.series(brand.slug, series.slug) },
          { label: model.name },
        ]}
      />
      <PageHeading
        icon={<BrandMark brand={brand.slug} size="md" />}
        title={`${model.name} parts`}
        description={
          <>
            Model codes <Figure className="text-ui-fg-base">{model.codes.join(", ")}</Figure>. Every part below is checked to fit this model.
          </>
        }
      />
      <nav aria-label={`Other ${series.name} models`} className="-mt-2 flex flex-wrap gap-2">
        {series.models.map((m) => (
          <Link
            key={m.slug}
            href={routes.model(brand.slug, series.slug, m.slug)}
            aria-current={m.slug === model.slug ? "page" : undefined}
            className={clx(
              "inline-flex h-8 items-center rounded-full px-3 txt-compact-small",
              m.slug === model.slug ? "bg-ui-bg-highlight text-ui-fg-interactive" : "text-ui-fg-subtle shadow-borders-base hover:text-ui-fg-base"
            )}
          >
            {m.name}
          </Link>
        ))}
      </nav>
      <ListingView
        products={productsForModel(model.slug)}
        viewer={viewer}
        params={facetParams}
        hrefFor={(fp) => routes.model(brand.slug, series.slug, model.slug, fp)}
        facets={["cat"]}
        groupByCategory
      />
    </PageContainer>
  )
}
