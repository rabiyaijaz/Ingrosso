import { SiteHeader } from "@/components/layout/SiteHeader"

// The landing page: shop header, then its own designed sections and footer.
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  )
}
