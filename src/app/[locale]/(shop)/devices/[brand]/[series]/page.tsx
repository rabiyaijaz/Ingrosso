import { notFound } from "next/navigation"
import { DeviceFinder } from "@/components/catalog/DeviceFinder"
import { Breadcrumbs, PageContainer, PageHeading } from "@/components/layout/Page"
import { BrandMark } from "@/components/brand/BrandMark"
import { BRANDS } from "@/lib/catalog"
import { deviceTree } from "@/lib/public"
import { routes } from "@/lib/routes"

type Params = { locale: string; brand: string; series: string }

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const p = await params
  const s = BRANDS.find((b) => b.slug === p.brand)?.series.find((x) => x.slug === p.series)
  return { title: s ? `${s.name} parts` : "Devices" }
}

// The same device finder as /devices, opened at this brand and series
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
      <PageHeading icon={<BrandMark brand={brand.slug} size="md" />} title={`${series.name} parts`} description="Pick the exact model. A Pro Max screen does not fit a Pro." />
      <div className="ig-card p-4 md:p-6">
        <DeviceFinder key={`${brand.slug}/${series.slug}`} tree={deviceTree()} initialBrand={brand.slug} initialSeries={series.slug} />
      </div>
    </PageContainer>
  )
}
