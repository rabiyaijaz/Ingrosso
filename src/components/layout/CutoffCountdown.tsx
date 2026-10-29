"use client"

import { useEffect, useState } from "react"

// Sample cut-off: orders before 18:00 Amsterdam time on weekdays ship that day.
// The real time per carrier comes from the client's shipping rules.
const CUTOFF_HOUR = 18
const FALLBACK = "Orders before 18:00 CET ship the same working day"

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

// The live cut-off sentence, refreshed every 30 seconds.
export function useCutoffText() {
  const [text, setText] = useState<string | null>(null)
  useEffect(() => {
    setText(message())
    const t = setInterval(() => setText(message()), 30_000)
    return () => clearInterval(t)
  }, [])
  return text ?? FALLBACK
}

export function CutoffCountdown() {
  return <span aria-live="polite">{useCutoffText()}</span>
}
