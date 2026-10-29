import Link from "next/link"
import { notFound } from "next/navigation"
import { Container, Heading, StatusBadge, Table, Text } from "@medusajs/ui"
import { Button } from "@/components/ui/Button"
import { CheckCircleSolid } from "@medusajs/icons"
import { Figure } from "@/components/commerce/Figure"
import { PageContainer } from "@/components/layout/Page"
import { productBySlug } from "@/lib/catalog"
import { formatMoney } from "@/lib/money"
import { findOrder } from "@/lib/orders"
import { routes } from "@/lib/routes"
import { CARRIERS, PAYMENTS, VAT_RATE } from "@/lib/totals"
import { getViewer } from "@/lib/viewer"

export const metadata = { title: "Order placed" }

const NEXT_STEP = {
  card: "Pay by card on the payment provider's page. The order is picked as soon as payment clears.",
  paypal: "Approve the payment in PayPal. The order is picked as soon as payment clears.",
  invoice: "Pay by bank transfer within 14 days of the invoice date. The order is picked now.",
} as const

export default async function OrderPage({ params }: { params: Promise<{ locale: string; ref: string }> }) {
  const { ref } = await params
  const viewer = await getViewer()
  const order = await findOrder(ref)
  if (!order || (viewer.state !== "approved" && viewer.state !== "masked")) notFound()
  const masked = viewer.state === "masked"
  const money = (m: number) => (masked ? "—" : formatMoney(m))
  const placed = new Date(order.placedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Amsterdam" })

  return (
    <PageContainer className="flex max-w-[880px] flex-col gap-8 pt-10">
      <div className="flex flex-col gap-3">
        <span className="flex items-center gap-2 text-ui-tag-green-icon"><CheckCircleSolid /><span className="txt-compact-small-plus">Order placed</span></span>
        <Heading level="h1" className="text-[32px] leading-[38px] font-medium tracking-[-0.02em]">
          Thank you. Your order is <Figure>{order.ref}</Figure>
        </Heading>
        <Text className="max-w-[60ch] text-ui-fg-subtle">{NEXT_STEP[order.payment]}</Text>
      </div>

      <Container className="grid gap-4 p-5 sm:grid-cols-4">
        <Fact label="Placed" value={placed} />
        <Fact label="Status" value={<StatusBadge color="blue">Received</StatusBadge>} />
        <Fact label="Shipping" value={CARRIERS.find((c) => c.id === order.carrier)?.name ?? ""} />
        <Fact label="Payment" value={PAYMENTS.find((p) => p.id === order.payment)?.name ?? ""} />
      </Container>

      <div className="overflow-hidden rounded-xl shadow-elevation-card-rest">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Part</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Qty</Table.HeaderCell>
              <Table.HeaderCell className="hidden text-right sm:table-cell">Unit</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Line total</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {order.lines.map((l) => {
              const p = productBySlug(l.slug)
              return (
                <Table.Row key={l.slug} className="[&_td]:h-auto [&_td]:py-3">
                  <Table.Cell className="whitespace-normal">
                    <span className="block txt-compact-small-plus">{p?.name ?? l.slug}</span>
                    <Figure className="txt-compact-small text-ui-fg-muted">{p?.sku}</Figure>
                  </Table.Cell>
                  <Table.Cell className="text-right"><Figure>{l.qty}</Figure></Table.Cell>
                  <Table.Cell className="hidden text-right sm:table-cell"><Figure>{money(l.unit)}</Figure></Table.Cell>
                  <Table.Cell className="text-right"><Figure>{money(l.unit * l.qty)}</Figure></Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      </div>

      <dl className="ml-auto flex w-full max-w-[320px] flex-col gap-2 txt-compact-small">
        {[
          ["Subtotal", money(order.subtotal)],
          ["Shipping", order.shipping === 0 ? "Free" : money(order.shipping)],
          [`VAT ${VAT_RATE}%`, money(order.vat)],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between"><dt className="text-ui-fg-subtle">{k}</dt><dd><Figure>{v}</Figure></dd></div>
        ))}
        <div className="flex justify-between pt-2 txt-compact-medium-plus"><dt>Total</dt><dd><Figure>{money(order.total)}</Figure></dd></div>
      </dl>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="large"><Link href={routes.account()}>View your orders</Link></Button>
        <Button asChild size="large" variant="secondary"><Link href={routes.devices()}>Keep shopping</Link></Button>
      </div>
    </PageContainer>
  )
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="txt-compact-small text-ui-fg-subtle">{label}</span>
      <span className="txt-compact-small-plus">{value}</span>
    </div>
  )
}
