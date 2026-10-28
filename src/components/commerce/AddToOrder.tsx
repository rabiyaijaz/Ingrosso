"use client"

import { useState, useTransition } from "react"
import { Button, clx, toast } from "@medusajs/ui"
import { ShoppingCart } from "@medusajs/icons"
import { setCartLine } from "@/app/actions"
import type { PriceBreak } from "@/lib/catalog"
import { formatMoney } from "@/lib/money"
import { Figure } from "./Figure"
import { QuantityStepper } from "./QuantityStepper"

type Props = {
  slug: string
  name: string
  orderStep: number
  breaks: PriceBreak[] | null // null when prices are masked
  maxAvailable: number | null
  variant?: "row" | "panel"
}

// Quantity + add, in a dense table row or the product page panel.
export function AddToOrder({ slug, name, orderStep, breaks, maxAvailable, variant = "panel" }: Props) {
  const [qty, setQty] = useState(orderStep)
  const [pending, start] = useTransition()
  const unit = breaks ? [...breaks].reverse().find((b) => qty >= b.minQty)?.unit ?? breaks[0].unit : null
  const over = maxAvailable !== null && qty > maxAvailable

  const add = () =>
    start(async () => {
      const res = await setCartLine(slug, qty)
      if (res.ok) toast.success("Added to order", { description: `${qty} × ${name}` })
      else toast.error("Could not add this part")
    })

  if (variant === "row") {
    return (
      <div className="flex items-center justify-end gap-2">
        <QuantityStepper value={qty} onChange={setQty} step={orderStep} size="small" label={`quantity of ${name}`} />
        <Button size="small" variant="secondary" onClick={add} isLoading={pending} aria-label={`Add ${name} to order`}>
          Add
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={qty} onChange={setQty} step={orderStep} label={`quantity of ${name}`} />
        <Button size="large" onClick={add} isLoading={pending} className="flex-1 min-w-[180px]">
          <ShoppingCart />
          Add to order
        </Button>
      </div>
      <div className={clx("flex items-baseline justify-between txt-compact-small", over ? "text-ui-tag-orange-text" : "text-ui-fg-subtle")}>
        <span>
          {over ? (
            <>Only <Figure>{maxAvailable}</Figure> available now</>
          ) : orderStep > 1 ? (
            <>Sold in multiples of <Figure>{orderStep}</Figure></>
          ) : (
            "Ships today if ordered before the cut-off"
          )}
        </span>
        {unit !== null && (
          <span className="text-ui-fg-base">
            Line total <Figure className="txt-compact-medium-plus">{formatMoney(unit * qty)}</Figure>
          </span>
        )}
      </div>
    </div>
  )
}
