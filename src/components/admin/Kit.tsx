import Link from "next/link"
import { Heading, clx } from "@medusajs/ui"
import { ChevronRight } from "@medusajs/icons"
import { Breadcrumbs } from "@/components/layout/Page"

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
        {/* The store's breadcrumb, ending on this page */}
        {crumbs && <Breadcrumbs items={[...crumbs, ...(typeof title === "string" ? [{ label: title }] : [])]} />}
        <Heading level="h1" data-size="compact" className="ig-page-title">{title}</Heading>
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

// Server-rendered tabs that are links (?status=), with a count on each. The
// same segmented control as the checkout and application steps (.ig-steps),
// sized to their labels.
export function Tabs({ tabs, active }: { tabs: { id: string; label: string; href: string; count?: number }[]; active: string }) {
  return (
    <nav aria-label="Views" data-fit className="ig-steps ig-no-scrollbar mb-4 overflow-x-auto">
      {tabs.map((t) => (
        <Link key={t.id} href={t.href} aria-current={t.id === active ? "page" : undefined} className="ig-steps__tab txt-compact-small-plus">
          {t.label}
          {t.count !== undefined && <span className="ig-figure txt-compact-xsmall text-ui-fg-muted">{t.count}</span>}
        </Link>
      ))}
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
