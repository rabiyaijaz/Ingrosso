import { Table, clx } from "@medusajs/ui"
import type { PriceBreak } from "@/lib/catalog"
import { formatMoney } from "@/lib/money"
import { Figure } from "./Figure"

// The quantity ladder. Each row equals the price charged at that quantity (PRC-05).
export function QuantityBreaks({ breaks, activeQty, className }: { breaks: PriceBreak[]; activeQty?: number; className?: string }) {
  const base = breaks[0]?.unit ?? 0
  const activeIndex = activeQty === undefined ? -1 : breaks.findLastIndex((b) => activeQty >= b.minQty)
  return (
    <Table className={clx("w-full", className)}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Quantity</Table.HeaderCell>
          <Table.HeaderCell className="text-right">Unit price</Table.HeaderCell>
          <Table.HeaderCell className="text-right">Saving</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {breaks.map((b, i) => {
          const next = breaks[i + 1]
          const saving = base - b.unit
          return (
            <Table.Row key={b.minQty} className={clx(i === activeIndex && "bg-ui-bg-highlight hover:bg-ui-bg-highlight")}>
              <Table.Cell>
                <Figure>{next ? `${b.minQty}–${next.minQty - 1}` : `${b.minQty}+`}</Figure>
              </Table.Cell>
              <Table.Cell className="text-right">
                <Figure className="text-ui-fg-base">{formatMoney(b.unit)}</Figure>
              </Table.Cell>
              <Table.Cell className="text-right text-ui-fg-subtle">
                {saving > 0 ? <Figure>−{formatMoney(saving)}</Figure> : "—"}
              </Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}
