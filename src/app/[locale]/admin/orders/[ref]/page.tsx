import Link from "next/link"
import { notFound } from "next/navigation"
import { StatusBadge, clx } from "@medusajs/ui"
import { Hashtag, ChatBubble, CheckMini, TruckFast } from "@medusajs/icons"
import { addOrderNote, setOrderStatus } from "@/app/admin-actions"
import { Field, NativeSelect, fieldClass } from "@/components/admin/Fields"
import { AdminHeader, Panel, ago, shortDate } from "@/components/admin/Kit"
import { Figure } from "@/components/commerce/Figure"
import { SubmitButton } from "@/components/ui/SubmitButton"
import { WithIcon } from "@/components/ui/WithIcon"
import { ORDER_STATUS, PAYMENT_STATE, TERMS_SHORT, getCustomers, getOrders, getTiers, type OrderStatus } from "@/lib/admin/data"
import { productBySlug } from "@/lib/catalog"
import { formatMoney } from "@/lib/money"
import { routes } from "@/lib/routes"

const FLOW: OrderStatus[] = ["new", "picking", "packed", "shipped", "delivered"]
const NEXT_LABEL: Partial<Record<OrderStatus, string>> = { new: "Start picking", picking: "Mark as packed", packed: "Mark as shipped", shipped: "Mark as delivered" }
const DONE_LABEL: Partial<Record<OrderStatus, string>> = { picking: "Picking started", packed: "Marked as packed", shipped: "Marked as shipped", delivered: "Marked as delivered" }
const CARRIERS = ["PostNL", "DHL", "DPD", "UPS"]

export default async function AdminOrderPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params
  const [orders, customers, tiers] = await Promise.all([getOrders(), getCustomers(), getTiers()])
  const o = orders.find((x) => x.ref === ref)
  if (!o) notFound()
  const c = customers.find((x) => x.id === o.customerId)
  const tier = tiers.find((t) => t.id === c?.tierId)
  const at = FLOW.indexOf(o.status)
  const next = at >= 0 && at < FLOW.length - 1 ? FLOW[at + 1] : null

  return (
    <>
      <AdminHeader
        crumbs={[{ label: "Orders", href: routes.admin.orders() }]}
        title={<Figure>{o.ref}</Figure>}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge color={ORDER_STATUS[o.status].color}>{ORDER_STATUS[o.status].label}</StatusBadge>
            <StatusBadge color={PAYMENT_STATE[o.payment].color}>{PAYMENT_STATE[o.payment].label}</StatusBadge>
            Placed {shortDate(o.placedAt)} by {c?.company}
          </span>
        }
      />

      {/* Progress through the warehouse, with the next step right beside it */}
      {o.status !== "cancelled" && (
        <div className="ig-card mb-6 flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <ol className="grid flex-1 grid-cols-5 gap-2" aria-label="Progress">
            {FLOW.map((s, i) => {
              const done = i <= at
              return (
                <li key={s} className="flex flex-col gap-2">
                  <span className="h-1.5 overflow-hidden rounded-full bg-ui-bg-component">
                    {done && <span className="ig-progress-fill block h-full rounded-full bg-ig-blue" style={{ animationDelay: `${i * 90}ms` }} />}
                  </span>
                  <span className={clx("flex items-center gap-1 txt-compact-small", done ? "text-ui-fg-base" : "text-ui-fg-muted")}>
                    {done && <CheckMini className="text-ui-fg-interactive" />}
                    {ORDER_STATUS[s].label}
                  </span>
                </li>
              )
            })}
          </ol>
          {next && (
            <form action={setOrderStatus} className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <input type="hidden" name="ref" value={o.ref} />
              <input type="hidden" name="status" value={next} />
              {/* Shipping needs the parcel's tracking, asked for in the same step */}
              {next === "shipped" && (
                <>
                  <NativeSelect name="carrier" aria-label="Carrier" defaultValue="PostNL" className="sm:w-28">
                    {CARRIERS.map((c) => <option key={c}>{c}</option>)}
                  </NativeSelect>
                  <WithIcon icon={<Hashtag />}>
                    <input name="tracking" required aria-label="Tracking number" placeholder="Tracking number" className={`${fieldClass} sm:w-44`} />
                  </WithIcon>
                </>
              )}
              <SubmitButton className="w-full sm:w-auto" done={DONE_LABEL[next]} doneDescription={o.ref}>{NEXT_LABEL[o.status]}</SubmitButton>
            </form>
          )}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="Lines" bodyClassName="px-0 pb-2">
          <table className="w-full txt-compact-small">
            <thead>
              <tr className="text-left text-ui-fg-subtle">
                <th className="px-5 py-2 font-normal">Part</th>
                <th className="px-3 py-2 text-right font-normal">Qty</th>
                <th className="hidden px-3 py-2 text-right font-normal sm:table-cell">Unit</th>
                <th className="px-5 py-2 text-right font-normal">Line total</th>
              </tr>
            </thead>
            <tbody>
              {o.lines.map((l, i) => {
                const p = productBySlug(l.slug)
                return (
                  <tr key={i} className="border-t border-ui-border-base">
                    <td className="px-5 py-2.5">
                      <p className="txt-compact-small-plus">{p?.name ?? l.slug}</p>
                      <Figure className="text-ui-fg-subtle">{p?.sku}</Figure>
                    </td>
                    <td className="px-3 py-2.5 text-right"><Figure>{l.qty}</Figure></td>
                    <td className="hidden px-3 py-2.5 text-right sm:table-cell"><Figure>{formatMoney(l.unit)}</Figure></td>
                    <td className="px-5 py-2.5 text-right"><Figure>{formatMoney(l.unit * l.qty)}</Figure></td>
                  </tr>
                )
              })}
              <tr className="border-t border-ui-border-base">
                <td colSpan={3} className="px-5 py-3 text-right txt-compact-small-plus">Total before VAT</td>
                <td className="px-5 py-3 text-right txt-compact-medium-plus"><Figure>{formatMoney(o.total)}</Figure></td>
              </tr>
            </tbody>
          </table>
        </Panel>
        <div className="flex flex-col gap-4">
          <Panel title="Account">
            {c && (
              <div className="flex flex-col gap-1 txt-compact-small">
                <Link href={routes.admin.customer(c.id)} className="txt-compact-small-plus text-ui-fg-interactive hover:underline">{c.company}</Link>
                <span className="text-ui-fg-subtle">{c.contact} · {c.city}, {c.country}</span>
                {tier && <span className="text-ui-fg-subtle">{tier.name} · {TERMS_SHORT[tier.terms]}</span>}
              </div>
            )}
          </Panel>
          {o.tracking && (
            <Panel title="Shipment">
              <p className="flex items-center gap-2 txt-compact-small">
                <TruckFast className="text-ui-fg-interactive" />
                {o.carrier} · <Figure>{o.tracking}</Figure>
              </p>
            </Panel>
          )}
          <Panel title="History">
            <ol className="flex flex-col gap-3">
              {[...(o.history ?? [])].reverse().map((h, i) => (
                <li key={i} className="ig-row-in flex gap-2 txt-compact-small" style={{ animationDelay: `${i * 40}ms` }}>
                  <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-[2px] bg-ig-blue" />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-ui-fg-base">{h.status ? ORDER_STATUS[h.status].label : h.note}</span>
                    {h.status && h.note && <span className="text-ui-fg-subtle">{h.note}</span>}
                    <span className="txt-compact-xsmall text-ui-fg-muted">{ago(h.at)}</span>
                  </span>
                </li>
              ))}
              <li className="flex gap-2 txt-compact-small">
                <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-[2px] bg-ui-fg-muted" />
                <span className="flex flex-col"><span>Placed by {c?.company}</span><span className="txt-compact-xsmall text-ui-fg-muted">{shortDate(o.placedAt)}</span></span>
              </li>
            </ol>
            <form action={addOrderNote} className="mt-4 flex flex-col gap-2 border-t border-ui-border-base pt-4">
              <input type="hidden" name="ref" value={o.ref} />
              <Field label="Add a note" hint="Only the trade desk sees notes." htmlFor="note">
                <WithIcon icon={<ChatBubble />}><input id="note" name="note" required maxLength={120} placeholder="For example: customer will collect" className={fieldClass} /></WithIcon>
              </Field>
              <SubmitButton variant="secondary" size="sm" done="Note added" className="self-start">Add note</SubmitButton>
            </form>
          </Panel>
          {o.status !== "cancelled" && o.status !== "shipped" && o.status !== "delivered" && (
            <Panel title="Cancel">
              <form action={setOrderStatus} className="flex flex-col gap-3">
                <input type="hidden" name="ref" value={o.ref} />
                <input type="hidden" name="status" value="cancelled" />
                <p className="txt-small text-ui-fg-subtle">Releases the reserved stock back to the shelf.</p>
                <SubmitButton variant="danger" done="Order cancelled" confirm={{ title: `Cancel ${o.ref}?`, description: "The reserved stock goes back to the shelf. This can't be undone.", confirmText: "Cancel order" }}>Cancel order</SubmitButton>
              </form>
            </Panel>
          )}
        </div>
      </div>
    </>
  )
}
