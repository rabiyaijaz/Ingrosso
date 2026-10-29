import Image from "next/image"
import { Heading, Text } from "@medusajs/ui"
import { SignInForm } from "@/components/account/SignInForm"
import { PageContainer } from "@/components/layout/Page"

export const metadata = { title: "Sign in" }

export default async function SignInPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const { next } = await searchParams
  return (
    <PageContainer className="grid items-center gap-10 pt-12 md:grid-cols-2">
      <div className="mx-auto flex w-full max-w-[400px] flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Heading level="h1" className="ig-page-title">Sign in</Heading>
          <Text className="text-ui-fg-subtle">See your prices, live stock and orders.</Text>
        </div>
        <SignInForm next={next} />
      </div>
      <div className="hidden overflow-hidden rounded-panel md:block">
        <Image src="/brand/scene-space-wide.webp" alt="Glass Ingrosso tiles floating against a starfield" width={2400} height={1018} className="h-[520px] w-full object-cover" />
      </div>
    </PageContainer>
  )
}
