import Link from "next/link"
import { Logo } from "@/components/brand/Logo"
import { BRANDS, CATEGORIES } from "@/lib/catalog"
import { routes } from "@/lib/routes"

// Working-screen footer. The landing page closes with its own designed footer.
export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ig-slate text-ig-on-slate">
      <div className="mx-auto grid max-w-page gap-10 px-[var(--ig-gutter)] py-14 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Logo tone="dark" />
          <p className="max-w-[34ch] txt-small text-ig-on-slate-soft">
            Trade-only supplier of phone and tablet repair parts. Prices and stock are shown to approved accounts.
          </p>
        </div>
        <FooterList title="Devices" links={BRANDS.map((b) => ({ href: routes.brand(b.slug), label: b.name }))} />
        <FooterList title="Parts" links={CATEGORIES.map((c) => ({ href: routes.category(c.slug), label: c.plural }))} />
        <FooterList
          title="Trade account"
          links={[
            { href: routes.apply(), label: "Apply for trade" },
            { href: routes.signIn(), label: "Sign in" },
            { href: routes.account(), label: "Your account" },
            { href: routes.grades(), label: "How we grade parts" },
          ]}
        />
      </div>
      <div className="mx-auto max-w-page px-[var(--ig-gutter)] pb-8 txt-compact-small text-ig-on-slate-soft">
        © 2026 Ingrosso
      </div>
    </footer>
  )
}

function FooterList({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="mb-3 txt-compact-small-plus">{title}</p>
      <ul className="flex flex-col gap-2 txt-compact-small text-ig-on-slate-soft">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="hover:text-ig-on-slate">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
