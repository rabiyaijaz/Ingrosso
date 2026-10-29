import Link from "next/link"
import { Heading, Table, Text } from "@medusajs/ui"
import { Button } from "@/components/ui/Button"
import { GradeBadge } from "@/components/catalog/Grade"
import { PartImage } from "@/components/catalog/PartImage"
import { CartLineQty } from "@/components/commerce/CartLineQty"
import { Figure } from "@/components/commerce/Figure"
import { GateCallout } from "@/components/commerce/GateCallout"
import { PageContainer, PageHeading } from "@/components/layout/Page"
import { cartWithProducts } from "@/lib/cart"
import { unitPriceAt } from "@/lib/commerce"
import { formatMoney } from "@/lib/money"
import { routes } from "@/lib/routes"
import { getViewer } from "@/lib/viewer"

export const metadata = { title: "Your order" }

export default async function CartPage() {
  const viewer = await getViewer()
  if (viewer.state !== "approved" && viewer.state !== "masked") {
    return (
      <PageContainer className="flex max-w-[640px] flex-col gap-6 pt-12">
        <PageHeading title="Your order" />
        <GateCallout state={viewer.state} />
      </PageContainer>
    )
  }

  const lines = await cartWithProducts()
  const masked = viewer.state === "masked"
  // Masked accounts still order; the price is resolved for the total only when unmasked.
  const priced = lines.map(({ line, product }) => {
    const unit = unitPriceAt(product, { ...viewer, state: "approved" }, line.qty) ?? 0
    return { line, product, unit, total: unit * line.qty }
  })
  const subtotal = priced.reduce((s, l) => s + l.total, 0)

  return (
    <PageContainer className="flex flex-col gap-8 pt-10">
      <PageHeading title="Your order" description="Prices update to the right quantity break as you change amounts.">
        {/* The next step in view without scrolling; on wide screens the summary beside the table carries it */}
        {lines.length > 0 && (
          <Button asChild className="lg:hidden"><Link href={routes.checkout()}>Continue to checkout</Link></Button>
        )}
      </PageHeading>
      {lines.length === 0 ? (
        <div className="ig-card flex flex-col items-start gap-3 p-6">
          <Text>Nothing in this order yet.</Text>
          <Button asChild variant="secondary"><Link href={routes.devices()}>Find parts by device</Link></Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="ig-card overflow-hidden">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Part</Table.HeaderCell>
                  <Table.HeaderCell>Quantity</Table.HeaderCell>
                  <Table.HeaderCell className="hidden text-right md:table-cell">Unit</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Line total</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {priced.map(({ line, product, unit, total }) => (
                  <Table.Row key={product.slug} className="[&_td]:h-auto [&_td]:py-3">
                    <Table.Cell className="whitespace-normal">
                      <div className="flex items-start gap-3">
                        <PartImage product={product} size={40} className="size-10 shrink-0" />
                        <div className="min-w-0">
                          <Link href={routes.product(product.slug)} className="txt-compact-small-plus hover:text-ui-fg-interactive">{product.name}</Link>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 txt-compact-xsmall text-ui-fg-muted">
                            <Figure className="whitespace-nowrap">{product.sku}</Figure>
                            {product.grade && <GradeBadge grade={product.grade} />}
                          </div>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <CartLineQty slug={product.slug} name={product.name} qty={line.qty} step={product.orderStep} />
                    </Table.Cell>
                    <Table.Cell className="hidden text-right md:table-cell"><Figure>{masked ? "—" : formatMoney(unit)}</Figure></Table.Cell>
                    <Table.Cell className="text-right"><Figure className="text-ui-fg-base">{masked ? "—" : formatMoney(total)}</Figure></Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
          <div className="ig-card flex h-fit flex-col gap-4 p-5">
            <Heading level="h2" className="txt-large-plus">Summary</Heading>
            <div className="flex justify-between txt-compact-small">
              <span className="text-ui-fg-subtle">Subtotal, excl. VAT</span>
              <Figure className="txt-compact-medium-plus">{masked ? "Hidden" : formatMoney(subtotal)}</Figure>
            </div>
            <Text size="small" className="text-ui-fg-subtle">
              VAT is applied at checkout from your registered tax number: domestic rate, EU reverse charge, or zero-rated export.
            </Text>
            <Button asChild size="large" className="w-full">
              <Link href={routes.checkout()}>Continue to checkout</Link>
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
