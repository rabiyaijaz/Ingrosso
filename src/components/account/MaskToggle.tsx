"use client"

import { useTransition } from "react"
import { Label, Switch, Text } from "@medusajs/ui"
import { setViewerState } from "@/app/actions"

// Approved customers can hide prices on screen for walk-in customers (ACC-07).
export function MaskToggle({ masked }: { masked: boolean }) {
  const [pending, start] = useTransition()
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <Label htmlFor="mask" weight="plus">Hide prices on screen</Label>
        <Text size="small" className="mt-1 max-w-[52ch] text-ui-fg-subtle">
          Show the catalogue to a customer at the counter without showing what you pay. Stock stays visible.
        </Text>
      </div>
      <Switch
        id="mask"
        checked={masked}
        disabled={pending}
        onCheckedChange={(v) => start(() => setViewerState(v ? "masked" : "approved"))}
      />
    </div>
  )
}
