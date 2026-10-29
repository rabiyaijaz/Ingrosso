"use client"

import Link from "next/link"
import { ArrowPath, ExclamationCircle } from "@medusajs/icons"
import { PageContainer } from "@/components/layout/Page"
import { Button } from "@/components/ui/Button"
import { EmptyState } from "@/components/ui/EmptyState"
import { routes } from "@/lib/routes"

// Something failed while loading the page. The order and the account are
// safe; offer a retry first.
export default function ShopError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PageContainer className="flex max-w-[640px] flex-col gap-6 pt-16">
      <EmptyState
        tone="card"
        icon={<ExclamationCircle />}
        title="This page didn't load"
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button iconLeft={<ArrowPath />} onClick={reset}>Try again</Button>
            <Button asChild variant="secondary"><Link href={routes.home()}>Go to the start</Link></Button>
          </div>
        }
      >
        Your order and account are safe. Try again in a moment.
      </EmptyState>
    </PageContainer>
  )
}
