"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowPath } from "@medusajs/icons"
import { toast } from "@medusajs/ui"
import { reorder } from "@/app/actions"
import { Button, type ButtonProps } from "@/components/ui/Button"
import { routes } from "@/lib/routes"

// Buy again: puts an earlier order's parts back in the current order, then
// opens it. Parts out of stock are left out, and the toast says so.
export function ReorderButton({ orderRef, label = "Buy again", ...props }: { orderRef: string; label?: string } & Omit<ButtonProps, "onClick" | "children">) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <Button
      variant="secondary"
      iconLeft={<ArrowPath />}
      {...props}
      isLoading={pending}
      onClick={() =>
        start(async () => {
          const res = await reorder(orderRef)
          if (!res.ok) return void toast.error("Could not reorder", { description: res.error })
          if (!res.added) return void toast.warning("Nothing added", { description: "Every part on that order is out of stock right now." })
          toast.success(`${res.added} part${res.added === 1 ? "" : "s"} added to your order`, {
            description: res.skipped ? `${res.skipped} out of stock, left out.` : `From ${orderRef}`,
          })
          router.push(routes.cart())
        })
      }
    >
      {label}
    </Button>
  )
}
