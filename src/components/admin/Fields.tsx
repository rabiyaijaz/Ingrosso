import { clx } from "@medusajs/ui"
import { ChevronUpDown } from "@medusajs/icons"

// Native form fields in the Medusa look, so admin forms post with plain
// server actions (no JavaScript needed to submit).

export const fieldClass =
  "h-9 w-full rounded-lg bg-ui-bg-field px-3 txt-compact-small text-ui-fg-base shadow-borders-base outline-none transition-shadow placeholder:text-ui-fg-muted hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active aria-[invalid=true]:shadow-borders-error"

export function NativeSelect({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={clx("relative block", className)}>
      <select {...rest} className={clx(fieldClass, "cursor-pointer appearance-none pr-8")}>
        {children}
      </select>
      <ChevronUpDown aria-hidden className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ui-fg-muted" />
    </span>
  )
}

export function Field({ label, hint, error, children, htmlFor }: { label: string; hint?: string; error?: string; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="txt-compact-small-plus text-ui-fg-base">{label}</label>
      {children}
      {error ? (
        <p className="txt-compact-small text-ui-fg-error">{error}</p>
      ) : (
        hint && <p className="txt-compact-small text-ui-fg-subtle">{hint}</p>
      )}
    </div>
  )
}
