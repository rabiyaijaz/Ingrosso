import Link from "next/link"
import { Table, clx } from "@medusajs/ui"
import { PriceTag } from "@/components/commerce/PriceTag"
import { StockTag } from "@/components/commerce/StockTag"
import { gradeById, type Product } from "@/lib/catalog"
import { commercialView } from "@/lib/commerce"
import { routes } from "@/lib/routes"
import type { Viewer } from "@/lib/viewer"
import { GradeBadge, GradeScale } from "./Grade"

// Every grade of the same part for the same model, side by side (CAT-04).
export function GradeCompare({ current, siblings, viewer }: { current: Product; siblings: Product[]; viewer: Viewer }) {
  const rows = [...siblings].filter((p) => p.grade).sort((a, b) => gradeById(a.grade!).rank - gradeById(b.grade!).rank)
  return (
    <div className="overflow-hidden rounded-xl shadow-elevation-card-rest">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Grade</Table.HeaderCell>
            <Table.HeaderCell className="hidden md:table-cell">What it is</Table.HeaderCell>
            <Table.HeaderCell className="hidden sm:table-cell">Stock</Table.HeaderCell>
            <Table.HeaderCell className="text-right">Your price</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((p) => {
            const g = gradeById(p.grade!)
            const view = commercialView(p, viewer)
            const isCurrent = p.slug === current.slug
            return (
              <Table.Row key={p.slug} className={clx("[&_td]:h-auto [&_td]:py-3", isCurrent && "bg-ui-bg-highlight hover:bg-ui-bg-highlight")}>
                <Table.Cell className="w-[220px]">
                  <div className="flex flex-col gap-2">
                    {isCurrent ? (
                      <span className="flex items-center gap-2"><GradeBadge grade={g.id} /><span className="txt-compact-xsmall text-ui-fg-interactive">Viewing</span></span>
                    ) : (
                      <Link href={routes.product(p.slug)} className="w-fit rounded-md outline-none focus-visible:shadow-borders-focus hover:opacity-80">
                        <GradeBadge grade={g.id} />
                      </Link>
                    )}
                    <GradeScale grade={g.id} className="w-[140px]" />
                  </div>
                </Table.Cell>
                <Table.Cell className="hidden whitespace-normal md:table-cell">
                  <span className="txt-small text-ui-fg-subtle">{g.summary}</span>
                </Table.Cell>
                <Table.Cell className="hidden sm:table-cell"><StockTag view={view.stock} /></Table.Cell>
                <Table.Cell className="text-right"><PriceTag view={view.price} className="items-end" /></Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
    </div>
  )
}
