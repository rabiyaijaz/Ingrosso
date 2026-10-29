import { MagnifyingGlass } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { WithIcon } from "./WithIcon"

// The one plain search field (a GET form's input): a pill with the leading
// magnifier from WithIcon. Sizes: sm 36 (lists, filter panels), md 40 (page
// headers). The header's typeahead (layout/SearchBox) is the only other search.
export function SearchField({
  size = "sm",
  className,
  inputClassName,
  ...input
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & { size?: "sm" | "md"; inputClassName?: string }) {
  return (
    <WithIcon icon={<MagnifyingGlass />} className={className}>
      <input
        type="search"
        {...input}
        className={clx(
          "w-full rounded-full bg-ui-bg-field pr-3 txt-compact-small text-ui-fg-base shadow-borders-base outline-none transition-shadow placeholder:text-ui-fg-muted hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active",
          size === "sm" ? "h-9" : "h-10",
          inputClassName
        )}
      />
    </WithIcon>
  )
}
