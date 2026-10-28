import Link from "next/link"
import { ArrowRight } from "@medusajs/icons"
import { Figure } from "@/components/commerce/Figure"
import { PRODUCTS, type Brand, type Series } from "@/lib/catalog"
import { routes } from "@/lib/routes"
import { PartGlyph } from "./PartGlyph"

// Model tiles for a series: name, codes, how many parts fit.
export function ModelGrid({ brand, series }: { brand: Brand; series: Series }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {series.models.map((m) => {
        const parts = PRODUCTS.filter((p) => p.models.includes(m.slug)).length
        return (
          <li key={m.slug}>
            <Link
              href={routes.model(brand.slug, series.slug, m.slug)}
              className="group flex h-full items-center gap-4 rounded-xl bg-ui-bg-base p-4 shadow-elevation-card-rest transition-shadow hover:shadow-elevation-card-hover outline-none focus-visible:shadow-borders-focus"
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-ui-bg-subtle">
                <PartGlyph category="screens" className="size-10" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block txt-compact-medium-plus text-ui-fg-base group-hover:text-ui-fg-interactive">{m.name}</span>
                <Figure className="block truncate txt-compact-xsmall text-ui-fg-muted">{m.codes.join(" · ")}</Figure>
                <span className="mt-1 block txt-compact-small text-ui-fg-subtle"><Figure>{parts}</Figure> parts</span>
              </span>
              <ArrowRight className="text-ui-fg-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ui-fg-interactive" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
