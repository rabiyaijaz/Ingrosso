import { notFound } from "next/navigation"
import { ListingView } from "@/components/catalog/ListingView"
import { Breadcrumbs, PageContainer, PageHeading } from "@/components/layout/Page"
import { PRODUCTS, categoryBySlug } from "@/lib/catalog"
import { routes } from "@/lib/routes"
import { getViewer } from "@/lib/viewer"

type Params = { locale: string; category: string }

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  return { title: categoryBySlug((await params).category)?.plural ?? "Parts" }
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<Record<string, string>> }) {
  const { category } = await params
  const sp = await searchParams
  const cat = categoryBySlug(category)
  if (!cat) notFound()
  const viewer = await getViewer()
  const products = PRODUCTS.filter((p) => p.category === cat.slug)

  return (
    <PageContainer className="flex flex-col gap-8 pt-6">
      <Breadcrumbs items={[{ label: "Parts" }, { label: cat.plural }]} />
      <PageHeading title={cat.plural} description="Narrow by brand, then pick the grade that suits the repair and the customer's budget." />
      <ListingView
        products={products}
        viewer={viewer}
        params={{ grade: sp.grade, brand: sp.brand }}
        hrefFor={(fp) => routes.category(cat.slug, fp)}
        facets={["brand"]}
      />
    </PageContainer>
  )
}
