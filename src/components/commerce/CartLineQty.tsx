"use client"

import { useState, useTransition } from "react"
import { Trash } from "@medusajs/icons"
import { clx, toast } from "@medusajs/ui"
import { Button } from "@/components/ui/Button"
import { setCartLine } from "@/app/actions"
import { QuantityStepper } from "./QuantityStepper"

// Quantity and remove for one line of the order. The line dims while the
// order updates; removing a line can be undone from the toast.
export function CartLineQty({ slug, name, qty, step }: { slug: string; name: string; qty: number; step: number }) {
  const [value, setValue] = useState(qty)
  const [pending, start] = useTransition()
  const commit = (n: number) => {
    setValue(n)
    start(() => setCartLine(slug, n, "set").then(() => undefined))
  }
  const remove = () => {
    const was = value
    commit(0)
    toast.info("Removed from your order", {
      description: name,
      action: { label: "Undo", altText: `Put ${name} back`, onClick: () => start(() => setCartLine(slug, was, "set").then(() => undefined)) },
    })
  }
  return (
    <div className={clx("flex items-center gap-2 transition-opacity", pending && "opacity-60")} aria-busy={pending}>
      <QuantityStepper value={value} onChange={commit} step={step} size="small" label={`quantity of ${name}`} />
      <Button size="sm" variant="ghost" iconOnly iconLeft={<Trash />} aria-label={`Remove ${name}`} onClick={remove} />
    </div>
  )
}
