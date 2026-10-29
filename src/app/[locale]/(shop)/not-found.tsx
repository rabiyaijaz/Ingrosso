import Link from "next/link"
import { MagnifyingGlass } from "@medusajs/icons"
import { PageContainer } from "@/components/layout/Page"
import { Button } from "@/components/ui/Button"
import { EmptyState } from "@/components/ui/EmptyState"
import { SearchField } from "@/components/ui/SearchField"
import { routes } from "@/lib/routes"

// A part, model or order that doesn't exist (an old link, a typed SKU): help
// the buyer find it instead of ending the trip.
export default function NotFound() {
  return (
    <PageContainer className="flex max-w-[640px] flex-col gap-6 pt-16">
      <EmptyState
        tone="card"
        icon={<MagnifyingGlass />}
        title="We couldn't find that page"
        action={
          <div className="flex w-full flex-col items-center gap-3">
            <form action={routes.search("")} method="get" role="search" className="w-full max-w-[360px]">
              <SearchField size="md" name="q" aria-label="Search all parts" placeholder="Model, code or SKU" autoFocus />
            </form>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild><Link href={routes.devices()}>Shop by device</Link></Button>
              <Button asChild variant="secondary"><Link href={routes.parts()}>All parts</Link></Button>
            </div>
          </div>
        }
      >
        The link may be old, or the part may have a new SKU. Search by model, code or SKU.
      </EmptyState>
    </PageContainer>
  )
}
