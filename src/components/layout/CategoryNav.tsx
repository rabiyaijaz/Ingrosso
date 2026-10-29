"use client"

import Image from "next/image"
import Link from "next/link"
import { PartGlassGlyph } from "@/components/catalog/PartIcon"
import type { IconStyle } from "@/lib/icon-styles"
import { CATEGORY_IMAGE } from "@/lib/visuals"
import { usePathname } from "next/navigation"
import { clx } from "@medusajs/ui"
import { routes } from "@/lib/routes"

// The header's category bar, the main way into the catalogue. It sits on an
// accent-tinted band (.ig-catbar) with stronger text; the page you are on is
// a solid accent pill. No colour transition, so a pill never fades between
// two categories while the page changes.
export function CategoryNav({ categories, iconStyle }: { categories: { slug: string; plural: string; icon: string }[]; iconStyle: IconStyle }) {
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
      <ul className="ig-no-scrollbar mx-auto flex h-12 max-w-page items-center gap-1 overflow-x-auto px-[calc(var(--ig-gutter)-14px)]">
        {/* Every category at a glance (the parts overview) */}
        <li>
          <Link href={routes.parts()} aria-current={pathname === routes.parts() ? "page" : undefined} className={clx(item(pathname === routes.parts()), "gap-2 pl-2")}>
            <svg viewBox="0 0 24 24" aria-hidden className={clx("size-[18px] shrink-0", pathname !== routes.parts() && "text-ui-fg-interactive")} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
              <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
              <rect x="13.5" y="3.5" width="7" height="7" rx="2" fill="currentColor" fillOpacity="0.16" />
              <rect x="3.5" y="13.5" width="7" height="7" rx="2" fill="currentColor" fillOpacity="0.16" />
              <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
            </svg>
            All parts
          </Link>
        </li>
        {categories.map((c) => {
          const href = routes.category(c.slug)
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <li key={c.slug}>
              <Link href={href} aria-current={active ? "page" : undefined} className={clx(item(active), "gap-2 pl-2")}>
                {/* Bare, no frame: the pill is the container */}
                {iconStyle === "glass" || !CATEGORY_IMAGE[c.slug] ? (
                  <PartGlassGlyph category={c.icon} className={clx("size-[18px]", !active && "text-ui-fg-interactive")} />
                ) : (
                  <Image src={CATEGORY_IMAGE[c.slug]} alt="" width={24} height={24} className="size-6 object-contain" />
                )}
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
