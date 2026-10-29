import { PageContainer } from "@/components/layout/Page"

// What a part listing looks like while it loads: the heading, the filter bar
// and table rows, as shimmering blocks (.ig-skeleton) in the listing's shape,
// so nothing jumps when the parts arrive.
export function ListingSkeleton() {
  return (
    <PageContainer className="flex flex-col gap-8 pt-6">
      <span className="sr-only" role="status">Loading parts</span>
      <div className="ig-skeleton h-4 w-48" />
      <div className="flex flex-col gap-3">
        <div className="ig-skeleton h-9 w-72" />
        <div className="ig-skeleton h-4 w-[420px] max-w-full" />
      </div>
      <div className="ig-skeleton h-[68px] w-full rounded-[22px]" />
      <div className="ig-card flex flex-col divide-y divide-ui-border-base overflow-hidden">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 px-6 py-4">
            <div className="ig-skeleton size-11 shrink-0" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="ig-skeleton h-3.5 w-[55%]" />
              <div className="ig-skeleton h-3 w-[25%]" />
            </div>
            <div className="ig-skeleton h-4 w-20" />
          </div>
        ))}
      </div>
    </PageContainer>
  )
}
