"use client"

import { useState, useTransition } from "react"
import { Trash } from "@medusajs/icons"
import { Button } from "@/components/ui/Button"
import { setCartLine } from "@/app/actions"
import { QuantityStepper } from "./QuantityStepper"

export function CartLineQty({ slug, name, qty, step }: { slug: string; name: string; qty: number; step: number }) {
  const [value, setValue] = useState(qty)
  const [pending, start] = useTransition()
  const commit = (n: number) => {
    setValue(n)
    start(() => setCartLine(slug, n, "set").then(() => undefined))
  }
  return (
    <div className="flex items-center gap-2" aria-busy={pending}>
      <QuantityStepper value={value} onChange={commit} step={step} size="small" label={`quantity of ${name}`} />
      <Button size="sm" variant="ghost" iconOnly iconLeft={<Trash />} aria-label={`Remove ${name}`} onClick={() => commit(0)} />
    </div>
  )
}
