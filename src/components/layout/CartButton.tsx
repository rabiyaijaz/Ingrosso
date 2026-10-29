"use client"

import Link from "next/link"
import { ShoppingCart } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { Figure } from "@/components/commerce/Figure"
import { Button } from "@/components/ui/Button"
import { routes } from "@/lib/routes"

// The header's order button. Built on the client so the Button's slot always
// receives a ready link (a server-streamed child can arrive late and leave the
// slot empty). The badge counts lines and is keyed on units, so it pops on
// every add.
export function CartButton({ lines, units }: { lines: number; units: number }) {
  return (
    <Button asChild variant="secondary" size="large" className={clx("ig-cart", lines > 0 && "is-filled")}>
      <Link href={routes.cart()} aria-label={`Order, ${lines} lines, ${units} units`}>
        <span className="relative inline-flex">
          <ShoppingCart />
          {lines > 0 && (
            <span key={units} aria-hidden className="ig-cart__badge">
              <Figure>{lines}</Figure>
            </span>
          )}
        </span>
        <span className="hidden md:inline">Order</span>
      </Link>
    </Button>
  )
}
