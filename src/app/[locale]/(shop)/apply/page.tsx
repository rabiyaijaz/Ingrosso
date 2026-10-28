import Image from "next/image"
import { ApplicationForm } from "@/components/account/ApplicationForm"
import { PageContainer, PageHeading } from "@/components/layout/Page"

export const metadata = { title: "Apply for a trade account" }

export default function ApplyPage() {
  return (
    <PageContainer className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="flex max-w-[680px] flex-col gap-8">
        <PageHeading
          title="Apply for a trade account"
          description="Four short steps, about five minutes. Your progress is saved as you go."
        />
        <ApplicationForm />
      </div>
      <aside className="hidden lg:block">
        <div className="sticky top-6 overflow-hidden rounded-panel bg-ig-slate">
          <Image src="/brand/mark-glass.webp" alt="The Ingrosso mark as a frosted glass tile" width={1024} height={1024} className="aspect-square w-full object-cover" />
          <ul className="flex flex-col gap-3 p-6 txt-small text-ig-on-slate">
            <li>Your own price on every part, with quantity breaks</li>
            <li>Live stock, and same-day dispatch before the cut-off</li>
            <li>VAT applied correctly for your country, invoices in your account</li>
          </ul>
        </div>
      </aside>
    </PageContainer>
  )
}
