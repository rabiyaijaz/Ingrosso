"use client"

import { useTransition } from "react"
import { Select } from "@medusajs/ui"
import { setViewerState } from "@/app/actions"
import { VIEWER_STATES, type ViewerState } from "@/lib/viewer-states"

// Design-review control: renders the storefront as each account state so the
// price gate can be reviewed. Remove when real authentication is connected.
export function PreviewAs({ state }: { state: ViewerState }) {
  const [pending, start] = useTransition()
  return (
    <label className="flex items-center gap-2">
      <span className="whitespace-nowrap txt-compact-small text-ig-on-slate-soft">Preview as</span>
      <Select size="small" value={state} onValueChange={(v) => start(() => setViewerState(v as ViewerState))}>
        <Select.Trigger aria-label="Preview as" className="h-6 min-w-[150px] bg-ig-slate-2 text-ig-on-slate shadow-none" aria-busy={pending}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {VIEWER_STATES.map((s) => (
            <Select.Item key={s.id} value={s.id}>{s.label}</Select.Item>
          ))}
        </Select.Content>
      </Select>
    </label>
  )
}
