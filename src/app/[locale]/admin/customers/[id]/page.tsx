import Link from "next/link"
import { notFound } from "next/navigation"
import { StatusBadge } from "@medusajs/ui"
import { ArrowRight, ChatBubble, CheckCircleSolid, ExclamationCircleSolid } from "@medusajs/icons"
import { WithIcon } from "@/components/ui/WithIcon"
import { decideApplication, setCustomerAccount } from "@/app/admin-actions"
import { Field, NativeSelect, fieldClass } from "@/components/admin/Fields"
import { AdminHeader, Panel, ago, shortDate } from "@/components/admin/Kit"
import { Figure } from "@/components/commerce/Figure"
import { SubmitButton } from "@/components/ui/SubmitButton"
import { CUSTOMER_STATUS, ORDER_STATUS, TERMS_SHORT, getCustomers, getOrders, getTiers } from "@/lib/admin/data"
import { euroWhole } from "@/lib/admin/stats"
import { formatMoney } from "@/lib/money"
import { routes } from "@/lib/routes"

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [customers, orders, tiers] = await Promise.all([getCustomers(), getOrders(), getTiers()])
  const c = customers.find((x) => x.id === id)
  if (!c) notFound()
  const theirs = orders.filter((o) => o.customerId === c.id)
  const spend = theirs.filter((o) => o.status !== "cancelled").reduce((t, o) => t + o.total, 0)
  const tier = tiers.find((t) => t.id === c.tierId)
  const status = CUSTOMER_STATUS[c.status]
  // Reviewers work through the queue: the oldest other application is one click away
  const nextPending = customers.filter((x) => x.status === "pending" && x.id !== c.id).sort((a, b) => a.appliedAt.localeCompare(b.appliedAt))[0]

  return (
    <>
      <AdminHeader
        crumbs={[{ label: "Customers", href: routes.admin.customers() }]}
        title={c.company}
        description={<span className="flex flex-wrap items-center gap-2"><StatusBadge color={status.color}>{status.label}</StatusBadge>{c.type} · {c.city}, {c.country}</span>}
      >
        {nextPending && (
          <Link href={routes.admin.customer(nextPending.id)} className="flex items-center gap-1 txt-compact-small-plus text-ui-fg-interactive hover:underline">
            Next application: {nextPending.company} <ArrowRight />
          </Link>
        )}
      </AdminHeader>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Panel title="Company details">
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Fact label="Contact" value={c.contact} />
              <Fact label="Email" value={<a href={`mailto:${c.email}`} className="text-ui-fg-interactive hover:underline">{c.email}</a>} />
              <Fact
                label="VAT number"
                value={
                  <span className="flex items-center gap-2">
                    <Figure>{c.vatId}</Figure>
                    {c.vatChecked ? (
                      <span className="flex items-center gap-1 text-ui-tag-green-text"><CheckCircleSolid className="text-ui-tag-green-icon" /> Valid in VIES</span>
                    ) : (
                      <span className="flex items-center gap-1 text-ui-tag-red-text"><ExclamationCircleSolid className="text-ui-tag-red-icon" /> Not found in VIES</span>
                    )}
                  </span>
                }
              />
              <Fact label="Business" value={c.type} />
              <Fact label="Location" value={`${c.city}, ${c.country}`} />
              <Fact label="Applied" value={`${shortDate(c.appliedAt)} (${ago(c.appliedAt)})`} />
            </dl>
            {c.note && <p className="ig-inset mt-4 px-4 py-3 txt-small text-ui-fg-subtle">{c.note}</p>}
          </Panel>

          <Panel title="Orders" action={<span className="txt-compact-small text-ui-fg-subtle">{theirs.length} orders · <Figure>{euroWhole(spend)}</Figure> in 30 days</span>} bodyClassName="px-0 pb-2">
            {theirs.length === 0 ? (
              <p className="px-5 txt-small text-ui-fg-subtle">{c.status === "approved" ? "No orders yet." : "Orders open once the account is approved."}</p>
            ) : (
              <table className="w-full txt-compact-small">
                <tbody>
                  {theirs.slice(0, 10).map((o) => (
                    <tr key={o.ref} className="border-t border-ui-border-base first:border-t-0 hover:bg-ui-bg-base-hover">
                      <td className="px-5 py-2.5"><Link href={routes.admin.order(o.ref)} className="text-ui-fg-interactive hover:underline"><Figure>{o.ref}</Figure></Link></td>
                      <td className="px-3 py-2.5 text-ui-fg-subtle">{shortDate(o.placedAt)}</td>
                      <td className="px-3 py-2.5 text-right"><Figure>{formatMoney(o.total)}</Figure></td>
                      <td className="px-5 py-2.5 text-right"><StatusBadge color={ORDER_STATUS[o.status].color}>{ORDER_STATUS[o.status].label}</StatusBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        </div>

        {/* The decision comes first on small screens, so it is in view without scrolling */}
        <div className="order-first flex flex-col gap-4 xl:order-none">
          {c.status === "pending" ? (
            <Panel title="Review the application">
              <ol className="mb-4 flex flex-col gap-2 txt-compact-small">
                <Check ok={c.vatChecked} label={c.vatChecked ? "Tax number valid" : "Tax number not found: ask for a registration extract"} />
                <Check ok={c.type !== "Reseller"} label={c.type === "Reseller" ? "Reseller: needs a reseller agreement" : "Trade use (repair, refurbishment or IT)"} />
              </ol>
              <form action={decideApplication} className="flex flex-col gap-3">
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="decision" value="approve" />
                <Field label="Price tier" hint="What this account pays. You can change it any time." htmlFor="tierId">
                  <NativeSelect id="tierId" name="tierId" defaultValue={c.type === "Reseller" ? "distributor" : tiers[0].id}>
                    {tiers.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.discount}% off list</option>)}
                  </NativeSelect>
                </Field>
                <SubmitButton size="lg" done="Application approved" doneDescription={`${c.company} can now see prices and order`}>Approve and show prices</SubmitButton>
              </form>
              <details className="ig-inset mt-4 p-3">
                <summary className="cursor-pointer txt-compact-small-plus text-ui-fg-subtle">Decline instead</summary>
                <form action={decideApplication} className="mt-3 flex flex-col gap-3">
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="decision" value="decline" />
                  <Field label="Reason, sent to the applicant" htmlFor="note">
                    <textarea id="note" name="note" rows={3} required className={`${fieldClass} h-auto py-2`} defaultValue={c.vatChecked ? "" : "We could not confirm your VAT number. Reply with a current registration extract and we will review again."} />
                  </Field>
                  <SubmitButton variant="danger" done="Application declined" confirm={{ title: `Decline ${c.company}?`, description: "The reason is sent to the applicant. They can apply again later.", confirmText: "Decline" }}>Decline application</SubmitButton>
                </form>
              </details>
            </Panel>
          ) : (
            <Panel title="Account">
              {c.status === "approved" || c.status === "suspended" ? (
                <form action={setCustomerAccount} className="flex flex-col gap-3">
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="action" value="tier" />
                  <Field label="Price tier" htmlFor="tier">
                    <NativeSelect id="tier" name="tierId" defaultValue={c.tierId ?? tiers[0].id}>
                      {tiers.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.discount}% off list</option>)}
                    </NativeSelect>
                  </Field>
                  {tier && (
                    <p className="txt-compact-small text-ui-fg-subtle">
                      {TERMS_SHORT[tier.terms]} · {tier.minOrder ? `minimum order ${euroWhole(tier.minOrder)}` : "no minimum order"} ·{" "}
                      <Link href={routes.admin.tier(tier.id)} className="text-ui-fg-interactive hover:underline">see the tier</Link>
                    </p>
                  )}
                  <SubmitButton variant="secondary" done="Tier saved">Save tier</SubmitButton>
                </form>
              ) : (
                <p className="txt-small text-ui-fg-subtle">This application was declined. The applicant can apply again.</p>
              )}
              {(c.status === "approved" || c.status === "suspended") && (
                <form action={setCustomerAccount} className="mt-4 flex flex-col gap-3 border-t border-ui-border-base pt-4">
                  <input type="hidden" name="id" value={c.id} />
                  {c.status === "approved" ? (
                    <>
                      <input type="hidden" name="action" value="suspend" />
                      <Field label="Pause ordering" hint="Prices are hidden until you reinstate the account." htmlFor="reason">
                        <WithIcon icon={<ChatBubble />}><input id="reason" name="note" placeholder="Reason shown to the customer" className={fieldClass} /></WithIcon>
                      </Field>
                      <SubmitButton variant="danger" done="Account suspended" confirm={{ title: `Suspend ${c.company}?`, description: "Their prices are hidden and they can't order until you reinstate the account.", confirmText: "Suspend" }}>Suspend account</SubmitButton>
                    </>
                  ) : (
                    <>
                      <input type="hidden" name="action" value="reinstate" />
                      <SubmitButton done="Account reinstated">Reinstate account</SubmitButton>
                    </>
                  )}
                </form>
              )}
            </Panel>
          )}
        </div>
      </div>
    </>
  )
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="txt-compact-small text-ui-fg-subtle">{label}</dt>
      <dd className="txt-compact-small-plus text-ui-fg-base">{value}</dd>
    </div>
  )
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-start gap-2">
      {ok ? <CheckCircleSolid className="mt-px shrink-0 text-ui-tag-green-icon" /> : <ExclamationCircleSolid className="mt-px shrink-0 text-ui-tag-red-icon" />}
      <span className={ok ? "text-ui-fg-base" : "text-ui-tag-red-text"}>{label}</span>
    </li>
  )
}
