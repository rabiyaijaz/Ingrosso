"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { clx } from "@medusajs/ui"
import { routes } from "@/lib/routes"

// The header's category bar. The page you are on is shown as a filled ink
// pill, the same active style as the grade filter.
export function CategoryNav({ categories }: { categories: { slug: string; plural: string }[] }) {
  const pathname = usePathname()
  const item = (active: boolean, accent = false) =>
    clx(
      "flex h-8 items-center whitespace-nowrap rounded-full px-3 transition-colors outline-none focus-visible:shadow-borders-focus",
      active
        ? "bg-ig-ink font-medium text-ig-paper"
        : accent
          ? "text-ui-fg-interactive hover:bg-ui-bg-base"
          : "text-ui-fg-subtle hover:bg-ui-bg-base hover:text-ui-fg-base"
    )

  return (
    <nav aria-label="Categories" className="bg-ui-bg-subtle">
      <ul className="mx-auto flex h-11 max-w-page items-center gap-1 overflow-x-auto px-[calc(var(--ig-gutter)-12px)] txt-compact-small">
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
