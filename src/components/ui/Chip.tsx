import { Slot } from "radix-ui"
import { clx } from "@medusajs/ui"

// The one chip: filter chips, applied-filter chips, model and brand picks,
// "fits" lists. A full pill (icons go in bare). Off: outline in subtle ink.
// Selected: accent wash, accent text and accent rim. The category bar and the
// grade-family tabs are their own controls and don't use it.
//
//   size      sm 32 · md 36 · lg 40 px tall
//   selected  sets aria-pressed for buttons and links that toggle a filter
//   static    a label that does nothing (no hover)
//   asChild   render as the child (a Next <Link> or a <button>)
export const chipClass = ({ size = "sm", selected, interactive = true }: { size?: "sm" | "md" | "lg"; selected?: boolean; interactive?: boolean } = {}) =>
  clx(
    "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full outline-none transition-[background-color,color,box-shadow] focus-visible:shadow-borders-focus",
    size === "sm" && "h-8 px-3 txt-compact-small",
    size === "md" && "h-9 px-3.5 txt-compact-small",
    size === "lg" && "h-10 px-4 txt-compact-small",
    selected
      ? "bg-ui-bg-highlight txt-compact-small-plus text-ui-fg-interactive shadow-borders-interactive-with-active"
      : clx("text-ui-fg-base shadow-borders-base", interactive && "hover:bg-ui-bg-base-hover")
  )

export function Chip({
  size,
  selected,
  static: isStatic,
  asChild,
  className,
  ...rest
}: React.HTMLAttributes<HTMLElement> & { size?: "sm" | "md" | "lg"; selected?: boolean; static?: boolean; asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"
  return (
    <Comp
      {...rest}
      aria-pressed={!isStatic && selected !== undefined ? selected : undefined}
      className={clx(chipClass({ size, selected, interactive: !isStatic }), className)}
    />
  )
}
