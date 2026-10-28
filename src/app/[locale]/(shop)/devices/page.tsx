import { DeviceFinder } from "@/components/catalog/DeviceFinder"
import { Breadcrumbs, PageContainer, PageHeading } from "@/components/layout/Page"
import { deviceTree } from "@/lib/public"

export const metadata = { title: "Shop by device" }

export default function DevicesPage() {
  return (
    <PageContainer className="flex flex-col gap-8 pt-6">
      <Breadcrumbs items={[{ label: "Devices" }]} />
      <PageHeading title="Shop by device" description="Start from the handset on your bench. Pick the brand, the series and the exact model." />
      <div className="rounded-2xl bg-ui-bg-base p-4 shadow-elevation-card-rest md:p-6">
        <DeviceFinder tree={deviceTree()} />
      </div>
    </PageContainer>
  )
}
