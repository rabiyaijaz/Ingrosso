"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { clx, toast } from "@medusajs/ui"
import { Button } from "@/components/ui/Button"
import { CheckMini, ShoppingCart } from "@medusajs/icons"
import { setCartLine } from "@/app/actions"
import type { PriceBreak } from "@/lib/catalog"
import { formatMoney } from "@/lib/money"
import { routes } from "@/lib/routes"
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

// Quantity + add, in a dense table row or the product page panel. After an add
// the button shows a tick for a moment and the toast links to the order.
export function AddToOrder({ slug, name, orderStep, breaks, maxAvailable, variant = "panel" }: Props) {
  const [qty, setQty] = useState(orderStep)
  const [pending, start] = useTransition()
  const [added, setAdded] = useState(false)
  const router = useRouter()
  const unit = breaks ? [...breaks].reverse().find((b) => qty >= b.minQty)?.unit ?? breaks[0].unit : null
  const over = maxAvailable !== null && qty > maxAvailable

  const add = () =>
    start(async () => {
      const res = await setCartLine(slug, qty)
      if (!res.ok) return void toast.error("Could not add this part")
      toast.success("Added to order", {
        description: `${qty} × ${name}`,
        action: { label: "View order", altText: "Open your order", onClick: () => router.push(routes.cart()) },
      })
      setAdded(true)
      window.setTimeout(() => setAdded(false), 1200)
    })

  if (variant === "row") {
    return (
      <div className="flex items-center justify-end gap-2">
        <QuantityStepper value={qty} onChange={setQty} step={orderStep} size="small" label={`quantity of ${name}`} />
        <Button size="small" variant="secondary" onClick={add} isLoading={pending} aria-label={`Add ${name} to order`} iconLeft={added ? <CheckMini className="text-ui-fg-interactive" /> : undefined}>
          {added ? "Added" : "Add"}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={qty} onChange={setQty} step={orderStep} label={`quantity of ${name}`} />
        <Button size="large" onClick={add} isLoading={pending} className="flex-1 min-w-[180px]">
          {added ? <CheckMini /> : <ShoppingCart />}
          {added ? "Added to order" : "Add to order"}
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
            {/* Flashes when the quantity (and so the break price) changes */}
            Line total <Figure key={unit * qty} className="ig-flash px-1 txt-compact-medium-plus">{formatMoney(unit * qty)}</Figure>
          </span>
        )}
      </div>
    </div>
  )
}
