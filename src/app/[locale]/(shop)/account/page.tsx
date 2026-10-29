import Link from "next/link"
import { Container, Heading, StatusBadge, Table, Text } from "@medusajs/ui"
import { Button } from "@/components/ui/Button"
import { MaskToggle } from "@/components/account/MaskToggle"
import { SignOutButton } from "@/components/account/SignOutButton"
import { CardIcon } from "@/components/commerce/ChoiceCard"
import { Figure } from "@/components/commerce/Figure"
import { MapPin } from "@medusajs/icons"
import { PageContainer, PageHeading } from "@/components/layout/Page"
import { formatMoney } from "@/lib/money"
import { readOrders } from "@/lib/orders"
import { routes } from "@/lib/routes"
import { getViewer } from "@/lib/viewer"

export const metadata = { title: "Your account" }

// Sample orders for design review; real orders come from the order history API.
const SAMPLE_ORDERS = [
  { ref: "IG-2026-004812", date: "27 Oct 2026", lines: 6, total: "€1,284.60", status: "Shipped" as const },
  { ref: "IG-2026-004655", date: "21 Oct 2026", lines: 3, total: "€612.00", status: "Packed" as const },
  { ref: "IG-2026-004390", date: "12 Oct 2026", lines: 11, total: "€2,940.15", status: "Shipped" as const },
]

const STATUS_COLOR = { Received: "orange", Shipped: "green", Packed: "blue" } as const

export default async function AccountPage() {
  const viewer = await getViewer()
  const placed = (await readOrders()).map((o) => ({
    ref: o.ref,
    href: routes.order(o.ref),
    date: new Date(o.placedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Amsterdam" }),
    lines: o.lines.length,
    total: formatMoney(o.total),
    status: "Received" as const,
  }))
  const orders = [...placed, ...SAMPLE_ORDERS.map((o) => ({ ...o, href: null as string | null }))]

  if (viewer.state === "visitor") {
    return (
      <PageContainer className="flex flex-col items-start gap-6 pt-12">
        <PageHeading title="Your account" description="Sign in to see your orders, invoices and prices." />
        <div className="flex gap-2">
          <Button asChild size="large"><Link href={routes.signIn()}>Sign in</Link></Button>
          <Button asChild size="large" variant="secondary"><Link href={routes.apply()}>Apply for trade</Link></Button>
        </div>
      </PageContainer>
    )
  }

  if (viewer.state === "pending" || viewer.state === "suspended") {
    const pending = viewer.state === "pending"
    return (
      <PageContainer className="flex max-w-[760px] flex-col gap-8 pt-10">
        <PageHeading title={viewer.company ?? "Your account"}>
          <SignOutButton />
        </PageHeading>
        <Container className="flex flex-col gap-4 p-6">
          <StatusBadge color={pending ? "orange" : "red"} className="w-fit">{pending ? "Application under review" : "Account suspended"}</StatusBadge>
          <Heading level="h2" className="txt-xlarge-plus">
            {pending ? "We are reviewing your application" : "Ordering is paused on this account"}
          </Heading>
          <Text className="text-ui-fg-subtle">
            {pending
              ? "A member of the trade desk checks your company and tax details by hand. You can browse the full catalogue meanwhile; prices and stock appear as soon as you are approved."
              : "Reason given by the trade desk: the VAT number on file could not be confirmed. Reply with a current registration certificate to restore ordering."}
          </Text>
          <ol className="mt-2 flex flex-col gap-3 txt-compact-small">
            <Step done label="Application received" />
            <Step done={!pending} label={pending ? "Review by the trade desk" : "Reviewed by the trade desk"} />
            <Step done={false} label={pending ? "Price list assigned, prices visible" : "Suspension lifted"} />
          </ol>
        </Container>
        <Button asChild variant="secondary" className="w-fit"><Link href={routes.devices()}>Browse the catalogue</Link></Button>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="flex flex-col gap-8 pt-10">
      <PageHeading title={viewer.company ?? "Your account"} description="Approved trade account">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge color="green">Approved · Trade standard price list</StatusBadge>
          <SignOutButton />
        </div>
      </PageHeading>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="flex flex-col gap-3">
          <Heading level="h2" className="txt-large-plus">Recent orders</Heading>
          <div className="overflow-hidden rounded-xl shadow-elevation-card-rest">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Order</Table.HeaderCell>
                  <Table.HeaderCell className="hidden sm:table-cell">Placed</Table.HeaderCell>
                  <Table.HeaderCell className="hidden sm:table-cell text-right">Lines</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Total</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {orders.map((o) => (
                  <Table.Row key={o.ref}>
                    <Table.Cell>
                      {o.href ? (
                        <Link href={o.href} className="text-ui-fg-interactive hover:underline"><Figure>{o.ref}</Figure></Link>
                      ) : (
                        <Figure>{o.ref}</Figure>
                      )}
                    </Table.Cell>
                    <Table.Cell className="hidden sm:table-cell">{o.date}</Table.Cell>
                    <Table.Cell className="hidden sm:table-cell text-right"><Figure>{o.lines}</Figure></Table.Cell>
                    <Table.Cell className="text-right"><Figure>{viewer.state === "masked" ? "—" : o.total}</Figure></Table.Cell>
                    <Table.Cell><StatusBadge color={STATUS_COLOR[o.status]}>{o.status}</StatusBadge></Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <Container className="p-5">
            <MaskToggle masked={viewer.state === "masked"} />
          </Container>
          <Container className="flex items-start gap-4 p-5">
            <CardIcon><MapPin /></CardIcon>
            <div className="flex flex-col gap-3">
              <Heading level="h2" className="txt-compact-medium-plus">Delivery address</Heading>
              <Text size="small" className="text-ui-fg-subtle">
                Fix Point Repairs B.V.<br />Sample street 12<br />3011 AA Rotterdam<br />Netherlands
              </Text>
            </div>
          </Container>
        </aside>
      </div>
    </PageContainer>
  )
}

function Step({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <span aria-hidden className={done ? "size-2.5 rounded-full bg-ui-tag-green-icon" : "size-2.5 rounded-full bg-ui-border-strong"} />
      <span className={done ? "text-ui-fg-base" : "text-ui-fg-subtle"}>{label}</span>
      <span className="sr-only">{done ? "done" : "not yet"}</span>
    </li>
  )
}
