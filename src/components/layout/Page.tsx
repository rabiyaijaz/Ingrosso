import Link from "next/link"
import { Heading, Text, clx } from "@medusajs/ui"
import { ChevronRight } from "@medusajs/icons"

// Page frame for working screens: one max width, one pair of gutters.
export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clx("mx-auto w-full max-w-page px-[var(--ig-gutter)]", className)}>{children}</div>
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="txt-compact-small text-ui-fg-subtle">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="text-ui-fg-muted" />}
            {it.href ? (
              <Link href={it.href} className="hover:text-ui-fg-base">{it.label}</Link>
            ) : (
              <span aria-current="page" className="text-ui-fg-base">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function PageHeading({ title, description, icon, children }: { title: string; description?: React.ReactNode; icon?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-2">
        <Heading level="h1" className="flex items-center gap-3 text-[32px] leading-[38px] font-medium tracking-[-0.02em]">
          {icon}
          {title}
        </Heading>
        {description && <Text className="max-w-[64ch] text-ui-fg-subtle">{description}</Text>}
      </div>
      {children}
    </div>
  )
}
