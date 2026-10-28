import { SiteFooter } from "@/components/layout/SiteFooter"

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter />
    </>
  )
}
