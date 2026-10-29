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
import "../themes.css"
import { cookies } from "next/headers"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Reveal } from "@/components/layout/Reveal"
import { Lab } from "@/components/lab/Lab"
import { LAB } from "@/lib/lab"
import { LOCALES } from "@/lib/routes"
import { DEFAULT_THEME, THEME_COOKIE, isTheme } from "@/lib/themes"

export const metadata: Metadata = {
  title: { default: "Ingrosso — Trade repair parts", template: "%s · Ingrosso" },
  description: "Trade-only wholesale of phone and tablet repair parts, in every quality grade.",
  // Preview builds stay out of search results until launch (BRD gate level 6).
  robots: { index: false, follow: false },
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!(LOCALES as readonly string[]).includes(locale)) notFound()
  // The lab can preview any theme; the main app always renders DEFAULT_THEME.
  const saved = LAB ? (await cookies()).get(THEME_COOKIE)?.value : undefined
  const theme = isTheme(saved) ? saved : DEFAULT_THEME
  const themed = theme !== "light"
  return (
    <html lang={locale} data-theme={themed ? theme : undefined} className={themed ? "dark" : undefined}>
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
