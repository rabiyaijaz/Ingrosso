"use client"

import { useEffect, useState } from "react"

// Sample cut-off: orders before 18:00 Amsterdam time on weekdays ship that day.
// The real time per carrier comes from the client's shipping rules.
const CUTOFF_HOUR = 18

function amsterdamNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Amsterdam",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date())
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ""
  return { day: get("weekday"), minutes: Number(get("hour")) * 60 + Number(get("minute")) }
}

function message() {
  const { day, minutes } = amsterdamNow()
  const weekend = day === "Sat" || day === "Sun"
  const left = CUTOFF_HOUR * 60 - minutes
  if (weekend || left <= 0) return "Orders placed now ship next working day"
  const h = Math.floor(left / 60)
  const m = left % 60
  return `Order in the next ${h ? `${h} h ` : ""}${m} min to ship today`
}

// withTruck: the animated truck, drawn for the blue top strip only.
export function CutoffCountdown({ withTruck = false }: { withTruck?: boolean }) {
  const [text, setText] = useState<string | null>(null)
  useEffect(() => {
    setText(message())
    const t = setInterval(() => setText(message()), 30_000)
    return () => clearInterval(t)
  }, [])
  const label = <span aria-live="polite" className="truncate">{text ?? "Orders before 18:00 CET ship the same working day"}</span>
  if (!withTruck) return label
  return (
    <span className="inline-flex min-w-0 items-center gap-2.5">
      <DeliveryTruck />
      {label}
    </span>
  )
}

// A small delivery truck that drives across its lane on a loop, over a
// moving road, with speed lines behind it. Decorative only.
function DeliveryTruck() {
  return (
    <span aria-hidden className="ig-truck-lane">
      <span className="ig-truck">
        <span className="ig-truck__speed" />
        <svg viewBox="0 0 24 16" width="22" height="15" fill="none">
          <path d="M1.5 3.2c0-.66.54-1.2 1.2-1.2h10.1c.66 0 1.2.54 1.2 1.2V12H1.5z" fill="currentColor" />
          <path d="M14 5.5h4.3c.4 0 .78.2 1 .53l2.4 3.4c.14.2.2.44.2.68V12H14z" fill="currentColor" opacity=".78" />
          <path d="M15.6 6.8h2.5l1.6 2.3h-4.1z" fill="var(--ig-blue, #3b5bfd)" opacity=".55" />
          <circle cx="5.5" cy="12.6" r="2" fill="currentColor" stroke="var(--ig-blue, #3b5bfd)" strokeWidth="1.2" />
          <circle cx="17.5" cy="12.6" r="2" fill="currentColor" stroke="var(--ig-blue, #3b5bfd)" strokeWidth="1.2" />
        </svg>
      </span>
    </span>
  )
}
