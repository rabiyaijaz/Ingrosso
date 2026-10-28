import { notFound } from "next/navigation"
import { Heading } from "@medusajs/ui"
import { ModelGrid } from "@/components/catalog/ModelGrid"
import { Breadcrumbs, PageContainer, PageHeading } from "@/components/layout/Page"
import { BRANDS } from "@/lib/catalog"
import { routes } from "@/lib/routes"

type Params = { locale: string; brand: string }

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { brand: slug } = await params
  const b = BRANDS.find((x) => x.slug === slug)
  return { title: b ? `${b.name} parts` : "Devices" }
}

export default async function BrandPage({ params }: { params: Promise<Params> }) {
  const { brand: slug } = await params
  const brand = BRANDS.find((b) => b.slug === slug)
  if (!brand) notFound()
  return (
    <PageContainer className="flex flex-col gap-10 pt-6">
      <Breadcrumbs items={[{ label: "Devices", href: routes.devices() }, { label: brand.name }]} />
      <PageHeading title={`${brand.name} parts`} description="Choose the model to see every part that fits it, in each grade we stock." />
      {brand.series.map((s) => (
        <section key={s.slug} className="flex flex-col gap-4">
          <Heading level="h2" className="txt-xlarge-plus">{s.name}</Heading>
          <ModelGrid brand={brand} series={s} />
        </section>
      ))}
    </PageContainer>
  )
}
