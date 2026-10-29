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
import { Reveal } from "@/components/layout/Reveal"
import { Lab } from "@/components/lab/Lab"
import { getPrefs } from "@/lib/prefs-server"
import { LOCALES } from "@/lib/routes"

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
  // Light or Dark from the person's preference (the lab can preview any theme)
  const { theme, dir } = await getPrefs()
  const themed = theme !== "light"
  return (
    <html lang={locale} dir={dir} data-theme={themed ? theme : undefined} className={themed ? "dark" : undefined}>
      <body>
        {/* Each area brings its own chrome: (home) and (shop) the store header, admin its sidebar */}
        {children}
        <Toaster />
        <Reveal />
        <Lab />
      </body>
    </html>
  )
}
