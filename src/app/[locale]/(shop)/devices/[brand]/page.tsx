import { notFound } from "next/navigation"
import { DeviceFinder } from "@/components/catalog/DeviceFinder"
import { Breadcrumbs, PageContainer, PageHeading } from "@/components/layout/Page"
import { BrandMark } from "@/components/brand/BrandMark"
import { BRANDS } from "@/lib/catalog"
import { deviceTree } from "@/lib/public"
import { routes } from "@/lib/routes"

type Params = { locale: string; brand: string }

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { brand: slug } = await params
  const b = BRANDS.find((x) => x.slug === slug)
  return { title: b ? `${b.name} parts` : "Devices" }
}

// The same device finder as /devices, opened at this brand
export default async function BrandPage({ params }: { params: Promise<Params> }) {
  const { brand: slug } = await params
  const brand = BRANDS.find((b) => b.slug === slug)
  if (!brand) notFound()
  return (
    <PageContainer className="flex flex-col gap-8 pt-6">
      <Breadcrumbs items={[{ label: "Devices", href: routes.devices() }, { label: brand.name }]} />
      <PageHeading icon={<BrandMark brand={brand.slug} size="md" />} title={`${brand.name} parts`} description="Choose the model to see every part that fits it, in each grade we stock." />
      <div className="ig-card p-4 md:p-6">
        <DeviceFinder key={brand.slug} tree={deviceTree()} initialBrand={brand.slug} />
      </div>
    </PageContainer>
  )
}
