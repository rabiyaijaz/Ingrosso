import { Clock, Receipt, ShieldCheck, Tag, TruckFast, User } from "@medusajs/icons"
import { ApplicationForm } from "@/components/account/ApplicationForm"
import { CardIcon } from "@/components/commerce/ChoiceCard"
import { PageContainer, PageHeading } from "@/components/layout/Page"
import { LogoStage } from "@/components/marketing/LogoStage"

export const metadata = { title: "Apply for a trade account" }

// What an approved account gets, each a short promise the store already keeps
const BENEFITS = [
  { icon: <Tag />, title: "Your own trade price", text: "On every part, and lower again at 5, 10 and 25 units." },
  { icon: <TruckFast />, title: "Ships the same day", text: "Order before 18:00 on a working day and it leaves today." },
  { icon: <ShieldCheck />, title: "Every grade named", text: "Ten grades from genuine to compatible, so every quote is honest." },
  { icon: <Receipt />, title: "VAT done for you", text: "Domestic rate, reverse charge or export, from your tax number." },
]

export default function ApplyPage() {
  return (
    <PageContainer className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_440px] xl:grid-cols-[minmax(0,1fr)_500px]">
      <div className="flex max-w-[680px] flex-col gap-8">
        <PageHeading
          title="Apply for a trade account"
          description="Four short steps, about five minutes. Your progress is saved as you go."
        />
        <ApplicationForm />
      </div>
      <aside className="hidden lg:block">
        <div className="ig-card sticky top-6 flex flex-col overflow-hidden">
          <LogoStage className="h-[200px] rounded-none shadow-none" />
          <div className="flex flex-col gap-5 p-6">
            <div className="flex flex-col gap-1.5">
              <p className="txt-compact-xsmall-plus uppercase tracking-[0.08em] text-ui-fg-interactive">Why repair shops trade here</p>
              <h2 className="text-[22px] font-medium leading-7 tracking-[-0.01em] text-ui-fg-base">The right part, at your price, out the door today</h2>
            </div>
            <ul className="flex flex-col gap-4">
              {BENEFITS.map((b) => (
                <li key={b.title} className="flex items-start gap-3">
                  <span className="mt-0.5"><CardIcon>{b.icon}</CardIcon></span>
                  <span className="flex flex-col gap-0.5">
                    <span className="txt-compact-small-plus text-ui-fg-base">{b.title}</span>
                    <span className="txt-small text-ui-fg-subtle">{b.text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 border-t border-ui-border-base pt-4 txt-compact-small text-ui-fg-subtle">
              <span className="flex items-center gap-1.5 rounded-full bg-ui-bg-subtle px-2.5 py-1"><Clock className="text-ui-fg-muted" /> About 5 minutes</span>
              <span className="flex items-center gap-1.5 rounded-full bg-ui-bg-subtle px-2.5 py-1"><User className="text-ui-fg-muted" /> Checked by a person</span>
            </div>
          </div>
        </div>
      </aside>
    </PageContainer>
  )
}
