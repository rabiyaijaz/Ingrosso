"use client"

import { useEffect, useState } from "react"
import { useCutoffText } from "./CutoffCountdown"

// The blue top strip: one centred line at a time, each with its own small
// animation, sliding into the next. Pauses while hovered. Only facts the shop
// already states elsewhere (dispatch, delivery threshold, grading, approval).
// Long enough for each animation to play through a few times before moving on
const HOLD_MS = 9000

export function StripTicker({ canOrder }: { canOrder: boolean }) {
  const cutoff = useCutoffText()
  const lines = [
    { anim: <TruckAnim />, text: cutoff },
    { anim: <CoinAnim />, text: "Free delivery on orders over €500" },
    { anim: <GradeAnim />, text: "Every part graded, from Genuine to Third-party" },
    canOrder
      ? { anim: <TagAnim />, text: "Your trade prices are on" }
      : { anim: <LockAnim />, text: "Trade accounts only. Prices after approval." },
  ]

  const [i, setI] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const t = setTimeout(() => {
      setPrev(i)
      setI((i + 1) % lines.length)
    }, HOLD_MS)
    return () => clearTimeout(t)
  }, [i, paused, lines.length])

  // Drop the outgoing line once its exit has played
  useEffect(() => {
    if (prev === null) return
    const t = setTimeout(() => setPrev(null), 600)
    return () => clearTimeout(t)
  }, [prev])

  return (
    <div className="ig-strip" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {prev !== null && (
        <span key={`out-${prev}`} aria-hidden className="ig-strip__line" data-state="out">
          {lines[prev].anim}
          <span className="truncate">{lines[prev].text}</span>
        </span>
      )}
      <span key={`in-${i}`} className="ig-strip__line" data-state="in">
        {lines[i].anim}
        <span className="truncate">{lines[i].text}</span>
      </span>
    </div>
  )
}

// Delivery truck driving over a moving road, with speed lines
function TruckAnim() {
  return (
    <span aria-hidden className="ig-strip__anim ig-truck-lane">
      <span className="ig-truck">
        <span className="ig-truck__speed" />
        <svg viewBox="0 0 24 16" width="22" height="15" fill="none">
          <path d="M1.5 3.2c0-.66.54-1.2 1.2-1.2h10.1c.66 0 1.2.54 1.2 1.2V12H1.5z" fill="currentColor" />
          <path d="M14 5.5h4.3c.4 0 .78.2 1 .53l2.4 3.4c.14.2.2.44.2.68V12H14z" fill="currentColor" opacity=".78" />
          <path d="M15.6 6.8h2.5l1.6 2.3h-4.1z" fill="var(--ig-blue)" opacity=".55" />
          <circle cx="5.5" cy="12.6" r="2" fill="currentColor" stroke="var(--ig-blue)" strokeWidth="1.2" />
          <circle cx="17.5" cy="12.6" r="2" fill="currentColor" stroke="var(--ig-blue)" strokeWidth="1.2" />
        </svg>
      </span>
    </span>
  )
}

// Euro coins dropping onto a stack, the last one spinning with a glint
function CoinAnim() {
  return (
    <span aria-hidden className="ig-strip__anim ig-coins">
      <span className="ig-coin" style={{ "--n": 0 } as React.CSSProperties} />
      <span className="ig-coin" style={{ "--n": 1 } as React.CSSProperties} />
      <span className="ig-coin ig-coin--top" style={{ "--n": 2 } as React.CSSProperties}>€</span>
      <span className="ig-glint" />
    </span>
  )
}

// Grade ladder: three bars fill in, then a tick draws itself
function GradeAnim() {
  return (
    <span aria-hidden className="ig-strip__anim ig-grades">
      <span className="ig-grades__bar" style={{ "--n": 0 } as React.CSSProperties} />
      <span className="ig-grades__bar" style={{ "--n": 1 } as React.CSSProperties} />
      <span className="ig-grades__bar" style={{ "--n": 2 } as React.CSSProperties} />
      <svg viewBox="0 0 16 16" width="14" height="14" className="ig-grades__tick">
        <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
      </svg>
    </span>
  )
}

// Price tag swinging in, with a sparkle
function TagAnim() {
  return (
    <span aria-hidden className="ig-strip__anim ig-tag">
      <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
        <path d="M2.5 9.6V3.4c0-.5.4-.9.9-.9h6.2c.24 0 .47.1.64.26l7.3 7.3a.9.9 0 010 1.28l-6.2 6.2a.9.9 0 01-1.28 0l-7.3-7.3a.9.9 0 01-.26-.64z" fill="currentColor" />
        <circle cx="6.3" cy="6.3" r="1.5" fill="var(--ig-blue)" />
      </svg>
      <span className="ig-glint" />
    </span>
  )
}

// Padlock whose shackle lifts open, then closes again
function LockAnim() {
  return (
    <span aria-hidden className="ig-strip__anim ig-lock">
      <svg viewBox="0 0 20 20" width="17" height="17" fill="none">
        <path className="ig-lock__shackle" d="M6.5 9V6.5a3.5 3.5 0 017 0V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="4" y="9" width="12" height="9" rx="2.5" fill="currentColor" />
        <circle cx="10" cy="13.4" r="1.4" fill="var(--ig-blue)" />
      </svg>
    </span>
  )
}
