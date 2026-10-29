import Link from "next/link"
import { redirect } from "next/navigation"
import { Heading, StatusBadge, Text } from "@medusajs/ui"
import { BellAlert, Buildings, CogSixTooth, CreditCard, LockClosedSolid, MapPin } from "@medusajs/icons"
import { MaskToggle } from "@/components/account/MaskToggle"
import { AddressCard, CompanyChange, LanguageSelect, NotifySwitch, PasswordForm, SettingsNav } from "@/components/account/Settings"
import { Figure } from "@/components/commerce/Figure"
import { ModeSwitch } from "@/components/layout/PrefControls"
import { Breadcrumbs, PageContainer, PageHeading } from "@/components/layout/Page"
import { getPrefs } from "@/lib/prefs-server"
import { routes } from "@/lib/routes"
import { NOTIFICATIONS, readAddresses, readNotify } from "@/lib/settings"
import { PAYMENTS } from "@/lib/totals"
import { getViewer } from "@/lib/viewer"

export const metadata = { title: "Account settings" }

// Sample company record, as the trade desk approved it
const COMPANY = {
  contact: "Sanne de Vries",
  email: "inkoop@fixpoint.example",
  vatId: "NL859312447B01",
  type: "Repair shop",
}

const SECTIONS = [
  { id: "company", label: "Company", icon: <Buildings /> },
  { id: "addresses", label: "Addresses", icon: <MapPin /> },
  { id: "payment", label: "Payment and credit", icon: <CreditCard /> },
  { id: "notifications", label: "Notifications", icon: <BellAlert /> },
  { id: "security", label: "Sign-in and security", icon: <LockClosedSolid /> },
  { id: "preferences", label: "Preferences", icon: <CogSixTooth /> },
]

export default async function SettingsPage() {
  const viewer = await getViewer()
  if (viewer.state === "visitor") redirect(`${routes.signIn()}?next=${encodeURIComponent(routes.accountSettings())}`)
  const [addresses, notify, prefs] = await Promise.all([readAddresses(), readNotify(), getPrefs()])
  const approved = viewer.state === "approved" || viewer.state === "masked"

  return (
    <PageContainer className="flex flex-col gap-8 pt-6">
      <Breadcrumbs items={[{ label: "Account", href: routes.account() }, { label: "Settings" }]} />
      <PageHeading title="Account settings" description={viewer.company} />

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
        <SettingsNav sections={SECTIONS} />

        <div className="flex flex-col gap-6">
          <Section id="company" title="Company" description="Checked by the trade desk when your account was approved. Changes go to them for review.">
            <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              <Row label="Registered name">{viewer.company}</Row>
              <Row label="Business type">{COMPANY.type}</Row>
              <Row label="VAT number"><span className="flex items-center gap-2"><Figure>{COMPANY.vatId}</Figure><StatusBadge color="green">Checked</StatusBadge></span></Row>
              <Row label="Contact">{COMPANY.contact}</Row>
              <Row label="Email">{COMPANY.email}</Row>
            </dl>
            <CompanyChange />
          </Section>

          <Section id="addresses" title="Addresses" description="Orders are sent to the delivery address. Checkout uses these.">
            <AddressCard kind="delivery" title="Delivery address" address={addresses.delivery} />
            <AddressCard kind="billing" title="Invoice address" address={addresses.billing} fallback="Same as delivery" />
          </Section>

          <Section id="payment" title="Payment and credit" description="How this account can pay at checkout.">
            {approved ? (
              <>
                <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  <Row label="Price list">Trade standard</Row>
                  <Row label="Credit limit">None on this account</Row>
                </dl>
                <ul className="flex flex-col divide-y divide-ui-border-base">
                  {PAYMENTS.map((p) => (
                    <li key={p.id} className="flex flex-col gap-0.5 py-3">
                      <span className="txt-compact-small-plus">{p.name}</span>
                      <span className="txt-compact-small text-ui-fg-subtle">{p.detail}</span>
                    </li>
                  ))}
                </ul>
                <Text size="small" className="text-ui-fg-subtle">
                  Invoices are on each order: open it from <Link href={routes.account()} className="text-ui-fg-interactive hover:underline">your orders</Link> and choose Print invoice.
                </Text>
              </>
            ) : (
              <Text size="small" className="text-ui-fg-subtle">Payment options appear once the account is approved.</Text>
            )}
          </Section>

          <Section id="notifications" title="Notifications" description={`Emails go to ${COMPANY.email}.`}>
            <div className="flex flex-col divide-y divide-ui-border-base">
              {NOTIFICATIONS.map((n) => <NotifySwitch key={n.id} id={n.id} label={n.label} hint={n.hint} on={notify[n.id]} />)}
            </div>
          </Section>

          <Section id="security" title="Sign-in and security" description={`You sign in with ${COMPANY.email}.`}>
            <PasswordForm />
          </Section>

          <Section id="preferences" title="Preferences" description="For you on this device. They don't change the account.">
            <div className="flex flex-col divide-y divide-ui-border-base">
              <PrefRow label="Appearance" hint="Light, or the dark theme."><ModeSwitch mode={prefs.mode} /></PrefRow>
              <PrefRow label="Language" hint="The store is in English for now; Arabic and Urdu switch the layout to right to left."><LanguageSelect lang={prefs.lang} /></PrefRow>
              {approved && <div className="py-3"><MaskToggle masked={viewer.state === "masked"} /></div>}
            </div>
          </Section>
        </div>
      </div>
    </PageContainer>
  )
}

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="ig-card flex scroll-mt-6 flex-col gap-4 p-5 md:p-6">
      <div className="flex flex-col gap-1">
        <Heading level="h2" className="txt-large-plus">{title}</Heading>
        {description && <Text size="small" className="text-ui-fg-subtle">{description}</Text>}
      </div>
      {children}
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="txt-compact-xsmall text-ui-fg-muted">{label}</dt>
      <dd className="txt-compact-small text-ui-fg-base">{children}</dd>
    </div>
  )
}

function PrefRow({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-3">
      <div>
        <span className="txt-compact-small-plus">{label}</span>
        <Text size="small" className="mt-0.5 max-w-[52ch] text-ui-fg-subtle">{hint}</Text>
      </div>
      {children}
    </div>
  )
}
