import Link from "next/link"
import { Heading, Table, clx } from "@medusajs/ui"
import { AddToOrder } from "@/components/commerce/AddToOrder"
import { Figure } from "@/components/commerce/Figure"
import { PriceTag } from "@/components/commerce/PriceTag"
import { StockTag } from "@/components/commerce/StockTag"
import { CATEGORIES, type Product } from "@/lib/catalog"
import { commercialView } from "@/lib/commerce"
import { routes } from "@/lib/routes"
import type { Viewer } from "@/lib/viewer"
import { GradeBadge } from "./Grade"
import { PartImage } from "./PartImage"

type Props = { products: Product[]; viewer: Viewer; groupByCategory?: boolean; className?: string }

// Dense, scannable listing (the McMaster-Carr reference in the BRD).
// Prices are resolved per row after filtering, never before (R8).
export function ProductTable({ products, viewer, groupByCategory = false, className }: Props) {
  const groups = groupByCategory
    ? CATEGORIES.map((c) => ({ title: c.plural, items: products.filter((p) => p.category === c.slug) })).filter((g) => g.items.length)
    : [{ title: null as string | null, items: products }]

  if (!products.length) {
    return (
      <div className="ig-inset px-6 py-12 text-center">
        <p className="txt-medium-plus">No parts match these filters</p>
        <p className="mt-1 txt-small text-ui-fg-subtle">Clear a grade or category to see more.</p>
      </div>
    )
  }

  const canOrder = viewer.state === "approved" || viewer.state === "masked"

  return (
    <div className={clx("flex flex-col gap-10", className)}>
      {groups.map((g) => (
        <section key={g.title ?? "all"} aria-label={g.title ?? "Parts"}>
          {g.title && (
            <Heading level="h2" className="mb-3 flex items-baseline gap-2 txt-xlarge-plus">
              {g.title}
              <Figure className="txt-compact-small text-ui-fg-muted">{g.items.length}</Figure>
            </Heading>
          )}
          <div className="ig-card overflow-hidden">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Part</Table.HeaderCell>
                  <Table.HeaderCell className="hidden md:table-cell">Grade</Table.HeaderCell>
                  <Table.HeaderCell className="hidden lg:table-cell">Stock</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Your price</Table.HeaderCell>
                  {canOrder && <Table.HeaderCell className="hidden w-[220px] text-right xl:table-cell">Order</Table.HeaderCell>}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {g.items.map((p) => {
                  const view = commercialView(p, viewer)
                  return (
                    <Table.Row key={p.slug} className="[&_td]:py-3 [&_td]:h-auto">
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-ui-bg-subtle">
                            <PartImage product={p} size={40} className="size-10" />
                          </span>
                          <div className="min-w-0">
                            <Link href={routes.product(p.slug)} className="block txt-compact-small-plus text-ui-fg-base hover:text-ui-fg-interactive">
                              {p.name}
                            </Link>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 txt-compact-xsmall text-ui-fg-muted">
                              <Figure>{p.sku}</Figure>
                              {p.grade && <GradeBadge grade={p.grade} className="md:hidden" />}
                              <StockTag view={view.stock} className="lg:hidden" />
                            </div>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="hidden md:table-cell">
                        {p.grade ? <GradeBadge grade={p.grade} /> : <span className="txt-compact-small text-ui-fg-muted">Not graded</span>}
                      </Table.Cell>
                      <Table.Cell className="hidden lg:table-cell">
                        <StockTag view={view.stock} />
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        <PriceTag view={view.price} className="items-end" />
                      </Table.Cell>
                      {canOrder && (
                        <Table.Cell className="hidden xl:table-cell">
                          {view.stock.kind === "out" ? (
                            <span className="block text-right txt-compact-small text-ui-fg-muted">—</span>
                          ) : (
                            <AddToOrder
                              variant="row"
                              slug={p.slug}
                              name={p.name}
                              orderStep={view.orderStep}
                              breaks={view.price.kind === "priced" ? view.price.breaks : null}
                              maxAvailable={view.stock.kind === "count" ? view.stock.available : null}
                            />
                          )}
                        </Table.Cell>
                      )}
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table>
          </div>
        </section>
      ))}
    </div>
  )
}
