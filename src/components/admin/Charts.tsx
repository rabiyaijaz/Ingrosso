"use client"

import { useState } from "react"
import { clx } from "@medusajs/ui"

// Admin charts, drawn in SVG from tokens (dataviz rules): one accent hue for a
// single series, thin marks, 4px rounded bar ends on the baseline, a 2px gap
// between bars, a recessive grid, text in ink (never the series colour), and
// a hover tooltip on every mark.

export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const w = 120, h = 32, max = Math.max(...values, 1), min = Math.min(...values, 0)
  const pts = values.map((v, i) => [(i / Math.max(values.length - 1, 1)) * w, h - 3 - ((v - min) / (max - min || 1)) * (h - 6)])
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden className={clx("h-8 w-full", className)}>
      <path d={`${line} L${w},${h} L0,${h} Z`} className="ig-chart-area" />
      <path d={line} className="ig-chart-line" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

// Daily revenue, 30 days: bars with a hover crosshair tooltip.
// Values arrive pre-formatted (server to client props can't carry functions).
export function DailyBars({
  days,
  scaleLabel,
  scaleMax,
}: {
  days: { label: string; long: string; value: number; display: string; orders: number; weekend: boolean }[]
  scaleLabel: string
  scaleMax: number
}) {
  const [hover, setHover] = useState<number | null>(null)
  const W = 720, H = 220, padL = 8, padB = 22, top = 10
  const max = Math.max(...days.map((d) => d.value), 1)
  const nice = Math.max(scaleMax, max)
  const slot = (W - padL) / days.length
  const bw = Math.max(4, slot - 2) // 2px surface gap between bars
  const y = (v: number) => top + (H - padB - top) * (1 - v / nice)
  const ticks = [0, nice / 2, nice]
  const hv = hover !== null ? days[hover] : null

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="ig-chart block h-[220px] w-full" role="img" aria-label="Revenue per day, last 30 days" onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <line key={t} x1={0} x2={W} y1={y(t)} y2={y(t)} className="ig-chart-grid" strokeDasharray={t ? "3 4" : undefined} />
        ))}
        {days.map((d, i) => {
          const x = padL + i * slot
          const h = Math.max(0, H - padB - y(d.value))
          return (
            <g key={i} onMouseEnter={() => setHover(i)}>
              {/* Hit target taller than the mark */}
              <rect x={x} y={top} width={slot} height={H - padB - top} fill="transparent" />
              {h > 0 && (
                <path
                  d={roundTop(x + 1, y(d.value), bw, h, Math.min(4, bw / 2))}
                  className={clx("ig-chart-bar", d.weekend && "ig-chart-bar--soft")}
                  data-on={hover === i || undefined}
                />
              )}
              {(i % 5 === 0 || i === days.length - 1) && (
                <text x={x + slot / 2} y={H - 6} textAnchor="middle" className="fill-ui-fg-muted text-[11px]">{d.label}</text>
              )}
            </g>
          )
        })}
      </svg>
      <div className="pointer-events-none absolute right-0 top-0 flex flex-col items-end gap-0.5 txt-compact-xsmall text-ui-fg-muted">
        <span>{scaleLabel}</span>
      </div>
      {hv && hover !== null && (
        <div
          role="status"
          className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-xl bg-ui-bg-base px-3 py-2 shadow-elevation-flyout"
          style={{ left: `${((padL + hover * slot + slot / 2) / W) * 100}%` }}
        >
          <p className="whitespace-nowrap txt-compact-xsmall text-ui-fg-subtle">{hv.long}</p>
          <p className="ig-figure whitespace-nowrap txt-compact-small-plus text-ui-fg-base">{hv.display}</p>
          <p className="whitespace-nowrap txt-compact-xsmall text-ui-fg-subtle">{hv.orders} order{hv.orders === 1 ? "" : "s"}</p>
        </div>
      )}
    </div>
  )
}

const roundTop = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`

// Horizontal bars for a ranked breakdown, value labels in ink beside each bar.
export function BarList({ rows }: { rows: { label: string; value: number; display: string; href?: string }[] }) {
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <ul className="ig-chart flex flex-col gap-2.5">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,110px)_minmax(0,1fr)_auto] items-center gap-3" title={`${r.label}: ${r.display}`}>
          <span className="truncate txt-compact-small text-ui-fg-subtle">{r.label}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-ui-bg-component">
            <span className="ig-chart-bar block h-full rounded-full" style={{ width: `${Math.max(2, (r.value / max) * 100)}%`, background: "var(--ig-blue)" }} />
          </span>
          <span className="ig-figure txt-compact-small-plus text-ui-fg-base">{r.display}</span>
        </li>
      ))}
    </ul>
  )
}
