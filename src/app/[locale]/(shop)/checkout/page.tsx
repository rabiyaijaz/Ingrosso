import Link from "next/link"
import { Text } from "@medusajs/ui"
import { Button } from "@/components/ui/Button"
import { CheckoutForm } from "@/components/commerce/CheckoutForm"
import { GateCallout } from "@/components/commerce/GateCallout"
import { PageContainer, PageHeading } from "@/components/layout/Page"
import { cartWithProducts } from "@/lib/cart"
import { unitPriceAt } from "@/lib/commerce"
import { routes } from "@/lib/routes"
import { getViewer } from "@/lib/viewer"

export const metadata = { title: "Checkout" }

// Sample saved address for the sample approved account.
const SAMPLE_ADDRESS = ["Sample street 12", "3011 AA Rotterdam", "Netherlands"]

export default async function CheckoutPage() {
  const viewer = await getViewer()
  if (viewer.state !== "approved" && viewer.state !== "masked") {
    return (
      <PageContainer className="flex max-w-[640px] flex-col gap-6 pt-12">
        <PageHeading title="Checkout" />
        <GateCallout state={viewer.state} />
      </PageContainer>
    )
  }

  const items = await cartWithProducts()
  if (!items.length) {
    return (
      <PageContainer className="flex max-w-[640px] flex-col gap-6 pt-12">
        <PageHeading title="Checkout" />
        <div className="ig-card flex flex-col items-start gap-3 p-6">
          <Text>Your order is empty.</Text>
          <Button asChild variant="secondary"><Link href={routes.devices()}>Find parts by device</Link></Button>
        </div>
      </PageContainer>
    )
  }

  const lines = items.map(({ line, product }) => {
    const unit = unitPriceAt(product, { ...viewer, state: "approved" }, line.qty) ?? 0
    return { slug: product.slug, name: product.name, sku: product.sku, category: product.category, grade: product.grade, qty: line.qty, total: unit * line.qty }
  })

  return (
    <PageContainer className="flex flex-col gap-8 pt-10">
      <PageHeading title="Checkout" />
      <CheckoutForm
        lines={lines}
        subtotal={lines.reduce((s, l) => s + l.total, 0)}
        masked={viewer.state === "masked"}
        company={viewer.company ?? ""}
        address={SAMPLE_ADDRESS}
      />
    </PageContainer>
  )
}
