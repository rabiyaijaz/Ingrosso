import Link from "next/link"

import { Button } from "@/components/ui/Button"
import { LockClosedSolid } from "@medusajs/icons"
import { routes } from "@/lib/routes"
import type { ViewerState } from "@/lib/viewer"

const COPY: Record<"visitor" | "pending" | "suspended", { title: string; body: string }> = {
  visitor: {
    title: "Trade prices are for approved accounts",
    body: "Apply once with your company and VAT details. After approval you see your own price and live stock on every part.",
  },
  pending: {
    title: "Your application is being reviewed",
    body: "A member of our trade desk checks every application by hand. Prices and stock appear here as soon as you are approved.",
  },
  suspended: {
    title: "This account is suspended",
    body: "Ordering is paused on this account. Your account page explains why and how to resolve it.",
  },
}

// What an unapproved viewer sees where the price and buy controls would be.
export function GateCallout({ state }: { state: ViewerState }) {
  if (state !== "visitor" && state !== "pending" && state !== "suspended") return null
  const copy = COPY[state]
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-ui-bg-subtle p-5">
      <div className="flex gap-3">
        <LockClosedSolid className="mt-0.5 shrink-0 text-ui-fg-interactive" />
        <div>
          <p className="txt-compact-medium-plus text-ui-fg-base">{copy.title}</p>
          <p className="mt-1 txt-small text-ui-fg-subtle">{copy.body}</p>
        </div>
      </div>
      {state === "visitor" ? (
        <div className="flex flex-wrap gap-2 pl-7">
          <Button asChild size="large"><Link href={routes.apply()}>Apply for a trade account</Link></Button>
          <Button asChild size="large" variant="transparent"><Link href={routes.signIn()}>Sign in</Link></Button>
        </div>
      ) : (
        <div className="pl-7">
          <Button asChild variant="secondary"><Link href={routes.account()}>View account status</Link></Button>
        </div>
      )}
    </div>
  )
}
