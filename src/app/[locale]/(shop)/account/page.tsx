import Link from "next/link"
import { Heading, StatusBadge, Table, Text } from "@medusajs/ui"
import { Button } from "@/components/ui/Button"
import { SignOutButton } from "@/components/account/SignOutButton"
import { CardIcon } from "@/components/commerce/ChoiceCard"
import { Figure } from "@/components/commerce/Figure"
import { BellAlert, CogSixTooth, MapPin } from "@medusajs/icons"
import { addressLines, readAddresses } from "@/lib/settings"
import { NotifyMe } from "@/components/commerce/NotifyMe"
import { ReorderButton } from "@/components/commerce/ReorderButton"
import { CheckDraw } from "@/components/ui/CheckDraw"
import { EmptyState } from "@/components/ui/EmptyState"
import { ORDER_STATUS, getOrderChanges } from "@/lib/admin/data"
import { productBySlug } from "@/lib/catalog"
import { readWatchList } from "@/lib/watch"
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
const STATUS_LABEL = { new: "Received", picking: "Picking", packed: "Packed", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" } as const

export default async function AccountPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const viewer = await getViewer()
  const [changes, watching, addresses] = await Promise.all([getOrderChanges(), readWatchList(), readAddresses()])
  // Orders placed here show where the trade desk has them
  const placed = (await readOrders()).map((o) => {
    const s = changes[o.ref]?.status ?? "new"
    return {
      ref: o.ref,
      href: routes.order(o.ref) as string | null,
      date: new Date(o.placedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Amsterdam" }),
      lines: o.lines.length,
      total: formatMoney(o.total),
      label: STATUS_LABEL[s] as string,
      color: ORDER_STATUS[s].color,
      again: true,
    }
  })
  const orders = [...placed, ...SAMPLE_ORDERS.map((o) => ({ ...o, href: null as string | null, label: o.status as string, color: STATUS_COLOR[o.status], again: false }))]
  const watched = watching.map((s) => productBySlug(s)).filter((p) => p !== undefined)

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
        {/* The moment right after applying: say it arrived */}
        {pending && sp.applied && (
          <div className="ig-card ig-row-in flex items-center gap-3 p-4 text-ui-tag-green-icon">
            <CheckDraw className="size-6" />
            <span className="flex flex-col">
              <span className="txt-compact-medium-plus text-ui-fg-base">Application sent</span>
              <span className="txt-compact-small text-ui-fg-subtle">We reply by email, usually within one working day.</span>
            </span>
          </div>
        )}
        <div className="ig-card flex flex-col gap-4 p-6">
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
        </div>
        <Button asChild variant="secondary" className="w-fit"><Link href={routes.devices()}>Browse the catalogue</Link></Button>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="flex flex-col gap-8 pt-10">
      <PageHeading title={viewer.company ?? "Your account"} description="Approved trade account">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge color="green">{viewer.state === "masked" ? "Approved · prices hidden" : "Approved · Trade standard price list"}</StatusBadge>
          <Button asChild variant="secondary" iconLeft={<CogSixTooth />}><Link href={routes.accountSettings()}>Settings</Link></Button>
          <SignOutButton />
        </div>
      </PageHeading>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="flex flex-col gap-3">
          <Heading level="h2" className="txt-large-plus">Recent orders</Heading>
          <div className="ig-card overflow-hidden">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Order</Table.HeaderCell>
                  <Table.HeaderCell className="hidden sm:table-cell">Placed</Table.HeaderCell>
                  <Table.HeaderCell className="hidden sm:table-cell text-right">Lines</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Total</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell><span className="sr-only">Buy again</span></Table.HeaderCell>
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
                    <Table.Cell><StatusBadge color={o.color}>{o.label}</StatusBadge></Table.Cell>
                    <Table.Cell className="text-right">{o.again && <ReorderButton orderRef={o.ref} size="sm" />}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          {/* Parts the buyer asked to hear about */}
          <div className="ig-card flex flex-col gap-3 p-5">
            <Heading level="h2" className="flex items-center gap-2 txt-compact-medium-plus"><BellAlert className="text-ui-fg-interactive" /> Back-in-stock alerts</Heading>
            {watched.length === 0 ? (
              <EmptyState tone="plain" title="No alerts" className="py-4">On an out-of-stock part, choose Email me when it&apos;s back.</EmptyState>
            ) : (
              <ul className="flex flex-col gap-3">
                {watched.map((p) => (
                  <li key={p.slug} className="flex items-center justify-between gap-3">
                    <Link href={routes.product(p.slug)} className="min-w-0 truncate txt-compact-small-plus hover:text-ui-fg-interactive">{p.name}</Link>
                    <NotifyMe slug={p.slug} name={p.name} watching size="sm" />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="ig-card flex items-start gap-4 p-5">
            <CardIcon><MapPin /></CardIcon>
            <div className="flex flex-col gap-3">
              <Heading level="h2" className="txt-compact-medium-plus">Delivery address</Heading>
              <Text size="small" className="text-ui-fg-subtle">
                {[viewer.company, ...addressLines(addresses.delivery)].map((l) => <span key={l} className="block">{l}</span>)}
              </Text>
              <Link href={routes.accountSettings("addresses")} className="txt-compact-small-plus text-ui-fg-interactive hover:underline">Change</Link>
            </div>
          </div>
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
