"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { clx } from "@medusajs/ui"
import { routes } from "@/lib/routes"

// The header's category bar, the main way into the catalogue. It sits on an
// accent-tinted band (.ig-catbar) with stronger text; the page you are on is
// a solid accent pill. No colour transition, so a pill never fades between
// two categories while the page changes.
export function CategoryNav({ categories }: { categories: { slug: string; plural: string }[] }) {
  const pathname = usePathname()
  const item = (active: boolean, accent = false) =>
    clx(
      "flex h-9 items-center whitespace-nowrap rounded-full px-3.5 txt-compact-medium-plus outline-none focus-visible:shadow-borders-focus",
      active
        ? "bg-ig-blue text-ig-on-accent shadow-[0_6px_16px_-8px_var(--ig-blue)]"
        : accent
          ? "text-ui-fg-interactive hover:bg-ig-surface"
          : "text-ig-ink hover:bg-ig-surface hover:shadow-[0_1px_2px_rgba(15,22,32,0.08)]"
    )

  return (
    <nav aria-label="Categories" className="ig-catbar">
      <ul className="mx-auto flex h-12 max-w-page items-center gap-1 overflow-x-auto px-[calc(var(--ig-gutter)-14px)]">
        {categories.map((c) => {
          const href = routes.category(c.slug)
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <li key={c.slug}>
              <Link href={href} aria-current={active ? "page" : undefined} className={item(active)}>
                {c.plural}
              </Link>
            </li>
          )
        })}
        <li className="ml-auto">
          <Link
            href={routes.grades()}
            aria-current={pathname === routes.grades() ? "page" : undefined}
            className={item(pathname === routes.grades(), true)}
          >
            How we grade parts
          </Link>
        </li>
      </ul>
    </nav>
  )
}
