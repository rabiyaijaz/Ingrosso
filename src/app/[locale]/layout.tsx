import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Toaster } from "@medusajs/ui"
import "@fontsource/inter/300.css"
import "@fontsource/inter/400.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/600.css"
import "@fontsource/roboto-mono/400.css"
import "@fontsource/roboto-mono/500.css"
import "../globals.css"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Reveal } from "@/components/layout/Reveal"
import { Lab } from "@/components/lab/Lab"
import { LOCALES } from "@/lib/routes"

export const metadata: Metadata = {
  title: { default: "Ingrosso — Trade repair parts", template: "%s · Ingrosso" },
  description: "Trade-only wholesale of phone and tablet repair parts, in every quality grade.",
  icons: { icon: "/brand/logo.webp" },
  // Preview builds stay out of search results until launch (BRD gate level 6).
  robots: { index: false, follow: false },
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!(LOCALES as readonly string[]).includes(locale)) notFound()
  return (
    <html lang={locale}>
      <body>
        <SiteHeader />
        {children}
        <Toaster />
        <Reveal />
        <Lab />
      </body>
    </html>
  )
}
