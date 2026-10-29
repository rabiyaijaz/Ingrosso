import Link from "next/link"
import { Heading, Table, Text } from "@medusajs/ui"
import { Button } from "@/components/ui/Button"
import { GradeBadge } from "@/components/catalog/Grade"
import { PartImage } from "@/components/catalog/PartImage"
import { CartLineQty } from "@/components/commerce/CartLineQty"
import { Figure } from "@/components/commerce/Figure"
import { GateCallout } from "@/components/commerce/GateCallout"
import { PageContainer, PageHeading } from "@/components/layout/Page"
import { ShoppingCart } from "@medusajs/icons"
import { ProductTable } from "@/components/catalog/ProductTable"
import { ReorderButton } from "@/components/commerce/ReorderButton"
import { EmptyState } from "@/components/ui/EmptyState"
import { cartWithProducts } from "@/lib/cart"
import { findModel, productsForModel } from "@/lib/catalog"
import { commercialView, unitPriceAt } from "@/lib/commerce"
import { readOrders } from "@/lib/orders"
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
  const lastOrder = (await readOrders())[0]
  // Finish the repair in one order: other parts for the handsets already in it
  const inCart = new Set(lines.map((l) => l.product.slug))
  const models = [...new Set(lines.map((l) => l.product.models[0]).filter(Boolean))]
  const extras = models
    .flatMap((m) => productsForModel(m))
    .filter((p, i, all) => !inCart.has(p.slug) && all.findIndex((x) => x.slug === p.slug) === i)
    .filter((p) => !lines.some((l) => l.product.category === p.category && l.product.models[0] === p.models[0]))
    .filter((p) => commercialView(p, viewer).stock.kind !== "out")
    .filter((p, i, all) => all.findIndex((x) => x.category === p.category && x.models[0] === p.models[0]) === i)
    .slice(0, 4)
  const firstModel = models[0] ? findModel(models[0]) : undefined

  return (
    <PageContainer className="flex flex-col gap-8 pt-10">
      <PageHeading title="Your order" description="Prices update to the right quantity break as you change amounts.">
        {/* The next step always in view, at the top, on every screen size */}
        {lines.length > 0 && (
          <Button asChild size="lg"><Link href={routes.checkout()}>Continue to checkout</Link></Button>
        )}
      </PageHeading>
      {lines.length === 0 ? (
        <EmptyState
          tone="card"
          icon={<ShoppingCart />}
          title="Nothing in this order yet"
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild><Link href={routes.devices()}>Find parts by device</Link></Button>
              {lastOrder && <ReorderButton orderRef={lastOrder.ref} label={`Order ${lastOrder.ref} again`} />}
            </div>
          }
        >
          Start from the handset you are repairing, or repeat your last order.
        </EmptyState>
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

      {extras.length > 0 && (
        <section className="flex flex-col gap-4">
          <div>
            <Heading level="h2" className="txt-xlarge-plus">Often added{firstModel ? ` for the ${firstModel.model.name}` : ""}</Heading>
            <Text className="mt-1 text-ui-fg-subtle">Other in-stock parts for the handsets in this order.</Text>
          </div>
          <ProductTable products={extras} viewer={viewer} />
        </section>
      )}
    </PageContainer>
  )
}
