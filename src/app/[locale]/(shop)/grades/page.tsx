import { Heading, Text } from "@medusajs/ui"
import { GradeBadge, GradeScale } from "@/components/catalog/Grade"
import { PageContainer, PageHeading } from "@/components/layout/Page"
import { GRADES } from "@/lib/catalog"

export const metadata = { title: "How we grade parts" }

export default function GradesPage() {
  const families = ["Genuine", "Aftermarket", "Third-party"] as const
  return (
    <PageContainer className="flex max-w-[960px] flex-col gap-12 pt-10">
      <PageHeading
        title="How we grade parts"
        description="Most suppliers sell “original” and “copy”. We name the real grade of every part, so you can quote a genuine screen or a compatible one and tell your customer exactly what each is."
      />
      {families.map((f) => (
        <section key={f} className="flex flex-col gap-4">
          <Heading level="h2" className="txt-xlarge-plus">{f}</Heading>
          <ul className="flex flex-col gap-3">
            {GRADES.filter((g) => g.family === f).map((g) => (
              <li key={g.id} className="ig-inset grid gap-3 p-5 md:grid-cols-[260px_1fr] md:items-center">
                <div className="flex flex-col gap-3">
                  <GradeBadge grade={g.id} className="w-fit" />
                  <GradeScale grade={g.id} />
                </div>
                <Text className="text-ui-fg-subtle">{g.summary}</Text>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </PageContainer>
  )
}
