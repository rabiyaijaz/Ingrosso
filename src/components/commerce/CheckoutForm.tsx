"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Checkbox, Container, Heading, Hint, Input, Label, ProgressTabs, RadioGroup, Text, clx, toast } from "@medusajs/ui"
import { Button } from "@/components/ui/Button"
import { placeOrder } from "@/app/actions"
import type { Money } from "@/lib/catalog"
import { LAB } from "@/lib/lab"
import { formatMoney } from "@/lib/money"
import { routes } from "@/lib/routes"
import { CARRIERS, PAYMENTS, VAT_RATE, orderTotals, type CarrierId, type PaymentId } from "@/lib/totals"
import { Figure } from "./Figure"
import { OrderSummary, type SummaryLine } from "./OrderSummary"
import { StepLabel } from "@/components/ui/StepLabel"
import { CardIcon, ChoiceCard } from "./ChoiceCard"
import { Bolt, BuildingStorefront, CreditCard, DocumentText, MapPin, Paypal, Receipt, TruckFast } from "@medusajs/icons"

const CARRIER_ICON: Record<CarrierId, React.ReactNode> = { postnl: <TruckFast />, ups: <Bolt />, collect: <BuildingStorefront /> }
const PAYMENT_ICON: Record<PaymentId, React.ReactNode> = { card: <CreditCard />, paypal: <Paypal />, invoice: <Receipt /> }

type StepId = "delivery" | "shipping" | "payment" | "review"
const STEPS: { id: StepId; label: string; hint: string }[] = [
  { id: "delivery", label: "Delivery", hint: "Address" },
  { id: "shipping", label: "Shipping", hint: "Carrier" },
  { id: "payment", label: "Payment", hint: "Method" },
  { id: "review", label: "Review", hint: "Place order" },
]

type Line = SummaryLine

type Props = {
  lines: Line[]
  subtotal: Money
  masked: boolean
  company: string
  address: string[]
}

// Four-step checkout, matching the application form's step pattern.
// Totals shown here are display only; placeOrder re-prices on the server.
export function CheckoutForm({ lines, subtotal, masked, company, address }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<StepId>("delivery")
  const [reached, setReached] = useState(0)
  const [reference, setReference] = useState("")
  const [sameInvoice, setSameInvoice] = useState(true)
  const [carrier, setCarrier] = useState<CarrierId>("postnl")
  const [payment, setPayment] = useState<PaymentId>("invoice")
  const [terms, setTerms] = useState(false)
  const [termsError, setTermsError] = useState(false)
  const [pending, start] = useTransition()

  const index = STEPS.findIndex((s) => s.id === step)
  const totals = orderTotals(subtotal, carrier)
  const money = (m: Money) => (masked ? "—" : formatMoney(m))

  const go = (n: number) => {
    setReached((r) => Math.max(r, n))
    setStep(STEPS[n].id)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const place = () => {
    if (!LAB && !terms) return setTermsError(true)
    start(async () => {
      const res = await placeOrder({ carrier, payment, reference })
      if (res.ok) router.push(routes.order(res.ref))
      else toast.error("Order not placed", { description: res.error })
    })
  }

  const carrierPrice = (id: CarrierId) => {
    const t = orderTotals(subtotal, id)
    return t.shipping === 0 ? "Free" : money(t.shipping)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <ProgressTabs value={step} onValueChange={(v) => setStep(v as StepId)} className="flex flex-col gap-8">
        <ProgressTabs.List className="ig-steps">
          {STEPS.map((s, i) => (
            <ProgressTabs.Trigger
              key={s.id}
              value={s.id}
              disabled={i > reached}
              status={i < index || i < reached ? "completed" : i === index ? "in-progress" : "not-started"}
              className={clx("ig-steps__tab", (i < index || i < reached) && i !== index && "is-done")}
            >
              <StepLabel n={i + 1} label={s.label} hint={s.hint} done={(i < index || i < reached) && i !== index} />
            </ProgressTabs.Trigger>
          ))}
        </ProgressTabs.List>

        <ProgressTabs.Content value="delivery" className="flex flex-col gap-5">
          <StepHead title="Where should it go?" body="Your saved delivery address. Add more addresses from your account." />
          <Container className="flex items-start gap-4 p-5">
            <CardIcon><MapPin /></CardIcon>
            <div className="flex flex-col gap-1">
              <Text weight="plus">{company}</Text>
              {address.map((l) => <Text key={l} size="small" className="text-ui-fg-subtle">{l}</Text>)}
            </div>
          </Container>
          <label className="flex items-center gap-3 txt-compact-small">
            <Checkbox checked={sameInvoice} onCheckedChange={(v) => setSameInvoice(v === true)} />
            Invoice to the same address
          </label>
          <div className="flex max-w-[360px] flex-col gap-1.5">
            <Label htmlFor="reference" size="small" weight="plus">Your reference</Label>
            <Input id="reference" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Job or PO number" aria-describedby="reference-hint" />
            <Hint id="reference-hint">Printed on the invoice and the packing slip. Optional.</Hint>
          </div>
        </ProgressTabs.Content>

        <ProgressTabs.Content value="shipping" className="flex flex-col gap-5">
          <StepHead title="How should it ship?" body="Free PostNL delivery on orders over €500 before VAT." />
          <RadioGroup value={carrier} onValueChange={(v) => setCarrier(v as CarrierId)} className="flex flex-col gap-2">
            {CARRIERS.map((c) => (
              <ChoiceCard key={c.id} value={c.id} icon={CARRIER_ICON[c.id]} label={c.name} aside={carrierPrice(c.id)} detail={c.detail} />
            ))}
          </RadioGroup>
        </ProgressTabs.Content>

        <ProgressTabs.Content value="payment" className="flex flex-col gap-5">
          <StepHead title="How will you pay?" body="Card details are entered on the payment provider's page, never on ours." />
          <RadioGroup value={payment} onValueChange={(v) => setPayment(v as PaymentId)} className="flex flex-col gap-2">
            {PAYMENTS.map((p) => (
              <ChoiceCard key={p.id} value={p.id} icon={PAYMENT_ICON[p.id]} label={p.name} detail={p.detail} />
            ))}
          </RadioGroup>
        </ProgressTabs.Content>

        <ProgressTabs.Content value="review" className="flex flex-col gap-5">
          <StepHead title="Check and place the order" body="Stock is reserved for you the moment the order is placed." />
          <dl className="grid gap-3 sm:grid-cols-2">
            {([
              ["Deliver to", `${company}, ${address.join(", ")}`, <MapPin key="i" />],
              ["Invoice to", sameInvoice ? "Same as delivery" : "Your invoice address on file", <Receipt key="i" />],
              ["Shipping", CARRIERS.find((c) => c.id === carrier)!.name, CARRIER_ICON[carrier]],
              ["Payment", PAYMENTS.find((p) => p.id === payment)!.name, PAYMENT_ICON[payment]],
              ["Your reference", reference || "None", <DocumentText key="i" />],
            ] as [string, string, React.ReactNode][]).map(([k, v, icon]) => (
              <div key={k} className="flex items-start gap-3 rounded-2xl bg-ui-bg-base p-4 shadow-elevation-card-rest">
                <CardIcon size="sm">{icon}</CardIcon>
                <div className="flex min-w-0 flex-col gap-0.5 txt-compact-small">
                  <dt className="text-ui-fg-subtle">{k}</dt>
                  <dd className="txt-compact-small-plus text-ui-fg-base">{v}</dd>
                </div>
              </div>
            ))}
          </dl>
          <div className="flex items-start gap-3">
            <Checkbox id="terms" checked={terms} onCheckedChange={(v) => { setTerms(v === true); setTermsError(false) }} aria-describedby={termsError ? "terms-hint" : undefined} />
            <div className="flex flex-col gap-1">
              <Label htmlFor="terms" size="small">I accept the trade terms of sale for this order.</Label>
              {termsError && <Hint id="terms-hint" variant="error">Please accept to place the order</Hint>}
            </div>
          </div>
        </ProgressTabs.Content>

        <div className={clx("flex items-center gap-3", index > 0 ? "justify-between" : "justify-end")}>
          {index > 0 && <Button variant="secondary" size="large" onClick={() => setStep(STEPS[index - 1].id)}>Back</Button>}
          {step === "review" ? (
            <Button size="large" onClick={place} isLoading={pending}>Place order</Button>
          ) : (
            <Button size="large" onClick={() => go(index + 1)}>Continue</Button>
          )}
        </div>
      </ProgressTabs>

      <OrderSummary lines={lines} totals={totals} masked={masked} freeShippingApplies={!!CARRIERS.find((c) => c.id === carrier)?.freeAbove} />
    </div>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={clx("flex justify-between", strong && "pt-2 txt-compact-medium-plus")}>
      <dt className={strong ? "text-ui-fg-base" : "text-ui-fg-subtle"}>{label}</dt>
      <dd><Figure>{value}</Figure></dd>
    </div>
  )
}

function StepHead({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-1">
      <Heading level="h2" className="txt-xlarge-plus">{title}</Heading>
      <Text className="text-ui-fg-subtle">{body}</Text>
    </div>
  )
}
