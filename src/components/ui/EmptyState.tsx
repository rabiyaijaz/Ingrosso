import { clx } from "@medusajs/ui"

// The one empty state: nothing in a list, a cart, a filtered view. A plain
// accent icon (optional), a short title, one line on what to do, and at most
// one action. `tone="card"` sits on its own glass card; `inset` sits inside a
// card or panel; `plain` has no surface (inside a Panel that already has one).
export function EmptyState({
  title,
  icon,
  action,
  tone = "inset",
  className,
  children,
}: {
  title: string
  icon?: React.ReactNode
  action?: React.ReactNode
  tone?: "card" | "inset" | "plain"
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={clx(
        "ig-row-in flex flex-col items-center gap-2 px-6 py-12 text-center",
        tone === "card" && "ig-card",
        tone === "inset" && "ig-inset",
        className
      )}
    >
      {icon && <span aria-hidden className="mb-1 text-ui-fg-interactive [&_svg]:size-6">{icon}</span>}
      <p className="txt-compact-medium-plus text-ui-fg-base">{title}</p>
      {children && <p className="max-w-[44ch] txt-small text-ui-fg-subtle">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
