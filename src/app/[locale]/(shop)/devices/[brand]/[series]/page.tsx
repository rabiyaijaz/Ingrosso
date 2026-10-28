import { notFound } from "next/navigation"
import { ModelGrid } from "@/components/catalog/ModelGrid"
import { Breadcrumbs, PageContainer, PageHeading } from "@/components/layout/Page"
import { BRANDS } from "@/lib/catalog"
import { routes } from "@/lib/routes"

type Params = { locale: string; brand: string; series: string }

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const p = await params
  const s = BRANDS.find((b) => b.slug === p.brand)?.series.find((x) => x.slug === p.series)
  return { title: s ? `${s.name} parts` : "Devices" }
}

export default async function SeriesPage({ params }: { params: Promise<Params> }) {
  const p = await params
  const brand = BRANDS.find((b) => b.slug === p.brand)
  const series = brand?.series.find((s) => s.slug === p.series)
  if (!brand || !series) notFound()
  return (
    <PageContainer className="flex flex-col gap-8 pt-6">
      <Breadcrumbs
        items={[
          { label: "Devices", href: routes.devices() },
          { label: brand.name, href: routes.brand(brand.slug) },
          { label: series.name },
        ]}
      />
      <PageHeading title={`${series.name} parts`} description="Pick the exact model. A Pro Max screen does not fit a Pro." />
      <ModelGrid brand={brand} series={series} />
    </PageContainer>
  )
}
