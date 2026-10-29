import Link from "next/link"
import { Heading, clx } from "@medusajs/ui"
import { ChevronRight } from "@medusajs/icons"

// Building blocks shared by every admin screen, so the trade desk changes in
// one place: page header, panel, stat tile, tabs, empty state.

export function AdminHeader({
  title,
  description,
  crumbs,
  children,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  crumbs?: { label: string; href: string }[]
  children?: React.ReactNode
}) {
  // Actions sit right under the title and description, where the eye already
  // is, not pushed to the far edge of a wide screen.
  return (
    <header className="mb-6 flex flex-col gap-4">
      <div className="flex min-w-0 flex-col gap-1.5">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 txt-compact-small text-ui-fg-subtle">
            {crumbs.map((c) => (
              <span key={c.href} className="flex items-center gap-1">
                <Link href={c.href} className="hover:text-ui-fg-base">{c.label}</Link>
                <ChevronRight className="text-ui-fg-muted" />
              </span>
            ))}
          </nav>
        )}
        <Heading level="h1" className="text-[28px] leading-[34px] font-medium tracking-[-0.02em]">{title}</Heading>
        {/* A div, not Text's <p>: descriptions can hold badges, which render divs */}
        {description && <div className="max-w-[70ch] txt-medium text-ui-fg-subtle">{description}</div>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  )
}

export function Panel({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={clx("ig-card flex min-w-0 flex-col", className)}>
      {(title || action) && (
        <div className="flex min-h-12 items-center justify-between gap-3 px-5 pt-4">
          {title && <Heading level="h2" className="txt-compact-medium-plus">{title}</Heading>}
          {action}
        </div>
      )}
      <div className={clx("min-w-0 flex-1 p-5", title ? "pt-3" : undefined, bodyClassName)}>{children}</div>
    </section>
  )
}

export function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-0.5 txt-compact-small-plus text-ui-fg-interactive hover:underline">
      {children} <ChevronRight />
    </Link>
  )
}

// Server-rendered tabs that are links (?status=), with a count on each.
export function Tabs({ tabs, active }: { tabs: { id: string; label: string; href: string; count?: number }[]; active: string }) {
  return (
    <nav aria-label="Views" className="ig-no-scrollbar mb-4 flex gap-1 overflow-x-auto rounded-full bg-ui-bg-component p-1 shadow-borders-base sm:w-fit">
      {tabs.map((t) => {
        const on = t.id === active
        return (
          <Link
            key={t.id}
            href={t.href}
            aria-current={on ? "page" : undefined}
            className={clx(
              "flex h-8 items-center gap-2 whitespace-nowrap rounded-full px-3.5 txt-compact-small-plus outline-none focus-visible:shadow-borders-focus",
              on ? "bg-ui-bg-base text-ui-fg-base shadow-elevation-card-rest" : "text-ui-fg-subtle hover:text-ui-fg-base"
            )}
          >
            {t.label}
            {t.count !== undefined && <span className="ig-figure txt-compact-xsmall text-ui-fg-muted">{t.count}</span>}
          </Link>
        )
      })}
    </nav>
  )
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <p className="txt-compact-medium-plus">{title}</p>
      {children && <p className="max-w-[44ch] txt-small text-ui-fg-subtle">{children}</p>}
    </div>
  )
}

export const ago = (iso: string) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 60) return `${mins} min ago`
  const h = Math.round(mins / 60)
  if (h < 24) return `${h} h ago`
  const d = Math.round(h / 24)
  return `${d} day${d === 1 ? "" : "s"} ago`
}

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/Amsterdam" })
