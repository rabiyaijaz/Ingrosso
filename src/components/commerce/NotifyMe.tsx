"use client"

import { useOptimistic, useTransition } from "react"
import { BellAlert, CheckMini } from "@medusajs/icons"
import { toast } from "@medusajs/ui"
import { toggleStockWatch } from "@/app/actions"
import { Button } from "@/components/ui/Button"

// Out of stock is not a dead end: the buyer asks to hear when the part is
// back. Pressing again stops the alert.
export function NotifyMe({ slug, name, watching, size = "md" }: { slug: string; name: string; watching: boolean; size?: "sm" | "md" | "lg" }) {
  const [on, setOn] = useOptimistic(watching)
  const [pending, start] = useTransition()
  return (
    <Button
      variant="secondary"
      size={size}
      aria-pressed={on}
      disabled={pending}
      iconLeft={on ? <CheckMini className="text-ui-fg-interactive" /> : <BellAlert />}
      onClick={() =>
        start(async () => {
          setOn(!on)
          const res = await toggleStockWatch(slug)
          if (res.ok) toast.success(res.on ? "We'll email you when it's back" : "Alert stopped", { description: name })
        })
      }
    >
      {on ? "We'll email you" : "Email me when it's back"}
    </Button>
  )
}
