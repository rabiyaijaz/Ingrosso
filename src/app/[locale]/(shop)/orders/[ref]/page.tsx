import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Heading, StatusBadge, Table, Text } from "@medusajs/ui"
import { Button } from "@/components/ui/Button"
import { CheckMini, TruckFast } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { Figure } from "@/components/commerce/Figure"
import { PrintButton } from "@/components/commerce/PrintButton"
import { ReorderButton } from "@/components/commerce/ReorderButton"
import { CheckDraw } from "@/components/ui/CheckDraw"
import { ORDER_STATUS, getOrderChanges, type OrderStatus } from "@/lib/admin/data"
import { PageContainer } from "@/components/layout/Page"
import { productBySlug } from "@/lib/catalog"
import { formatMoney } from "@/lib/money"
import { findOrder } from "@/lib/orders"
import { routes } from "@/lib/routes"
import { CARRIERS, PAYMENTS, VAT_RATE } from "@/lib/totals"
import { getViewer } from "@/lib/viewer"

export async function generateMetadata({ params }: { params: Promise<{ ref: string }> }) {
  return { title: `Order ${(await params).ref}` }
}

// What the buyer sees of the warehouse flow (the trade desk moves it on)
const FLOW: OrderStatus[] = ["new", "picking", "packed", "shipped", "delivered"]
const FLOW_LABEL: Record<OrderStatus, string> = { new: "Received", picking: "Picking", packed: "Packed", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" }

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
  const change = (await getOrderChanges())[order.ref]
  const status: OrderStatus = change?.status ?? "new"
  const at = FLOW.indexOf(status)
  const fresh = status === "new"

  return (
    <PageContainer className="flex max-w-[880px] flex-col gap-8 pt-10">
      <div className="flex flex-col-reverse items-start gap-6 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-col gap-3">
          <span className="flex items-center gap-2 text-ui-tag-green-icon">
            {fresh ? <CheckDraw className="size-5" /> : <CheckMini />}
            <span className="txt-compact-small-plus">{fresh ? "Order placed" : `Order ${FLOW_LABEL[status].toLowerCase()}`}</span>
          </span>
          <Heading level="h1" className="ig-page-title">
            {fresh ? <>Thank you. Your order is <Figure>{order.ref}</Figure></> : <>Order <Figure>{order.ref}</Figure></>}
          </Heading>
          <Text className="max-w-[60ch] text-ui-fg-subtle">{fresh ? NEXT_STEP[order.payment] : status === "cancelled" ? "This order was cancelled. Nothing will be charged." : "We'll email you at every step."}</Text>
          {/* Next steps in view: order again, keep the invoice, see every order */}
          <div className="ig-no-print flex flex-wrap gap-2 pt-1">
            <ReorderButton orderRef={order.ref} />
            <PrintButton label="Print invoice" />
            <Button asChild variant="secondary"><Link href={routes.account()}>All orders</Link></Button>
          </div>
        </div>
        <Image src="/states/order-confirmed.webp" alt="" width={168} height={168} priority className="ig-float ig-no-print size-[140px] shrink-0 object-contain sm:size-[168px]" />
      </div>

      {/* Where the order is: the trade desk moves it on, the buyer sees it here */}
      {status !== "cancelled" && (
        <div className="ig-card flex flex-col gap-4 p-5">
          <ol className="grid grid-cols-5 gap-2" aria-label="Order progress">
            {FLOW.map((s, i) => {
              const done = i <= at
              return (
                <li key={s} className="flex flex-col gap-2" aria-current={i === at ? "step" : undefined}>
                  <span className="h-1.5 overflow-hidden rounded-full bg-ui-bg-component">
                    {done && <span className="ig-progress-fill block h-full rounded-full bg-ig-blue" style={{ animationDelay: `${i * 90}ms` }} />}
                  </span>
                  <span className={clx("flex items-center gap-1 txt-compact-small", done ? "text-ui-fg-base" : "text-ui-fg-muted")}>
                    {done && <CheckMini className="hidden text-ui-fg-interactive sm:block" />}
                    {FLOW_LABEL[s]}
                  </span>
                </li>
              )
            })}
          </ol>
          {change?.tracking && (
            <p className="flex flex-wrap items-center gap-2 txt-compact-small">
              <TruckFast className="text-ui-fg-interactive" />
              {change.carrier} tracking <Figure className="txt-compact-small-plus">{change.tracking}</Figure>
            </p>
          )}
        </div>
      )}

      <div className="ig-card grid gap-4 p-5 sm:grid-cols-4">
        <Fact label="Placed" value={placed} />
        <Fact label="Status" value={<StatusBadge color={ORDER_STATUS[status].color}>{FLOW_LABEL[status]}</StatusBadge>} />
        <Fact label="Shipping" value={CARRIERS.find((c) => c.id === order.carrier)?.name ?? ""} />
        <Fact label="Payment" value={PAYMENTS.find((p) => p.id === order.payment)?.name ?? ""} />
      </div>

      <div className="ig-card overflow-hidden">
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
                    {p ? <Link href={routes.product(p.slug)} className="block txt-compact-small-plus hover:text-ui-fg-interactive">{p.name}</Link> : <span className="block txt-compact-small-plus">{l.slug}</span>}
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

      {(order.reference || order.note) && (
        <div className="ig-inset grid gap-3 p-4 txt-compact-small sm:grid-cols-2">
          {order.reference && <Fact label="Your reference" value={order.reference} />}
          {order.note && <Fact label="Note for the warehouse" value={order.note} />}
        </div>
      )}

      <div className="ig-no-print flex flex-wrap gap-2">
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
