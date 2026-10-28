import Link from "next/link"
import { MagnifyingGlass, LockClosedSolid, Clock } from "@medusajs/icons"
import { GradeBadge, GradeScale } from "@/components/catalog/Grade"
import { Figure } from "@/components/commerce/Figure"
import { CutoffCountdown } from "@/components/layout/CutoffCountdown"
import { PRODUCTS, findModel, gradeById } from "@/lib/catalog"
import { routes } from "@/lib/routes"

// Real interface fragments for the landing page's four questions. Built from
// the live catalogue and the shared components; never shows a price or stock.

const frame = "rounded-[16px] bg-ig-paper p-4 sm:p-5"

export function FitFragment() {
  const ref = findModel("galaxy-s25-ultra")!
  const parts = PRODUCTS.filter((p) => p.models.includes(ref.model.slug)).length
  return (
    <div data-ui className={frame}>
      <div className="flex h-11 items-center gap-2 rounded-full bg-white px-4 txt-compact-small shadow-borders-base">
        <MagnifyingGlass className="text-ui-fg-muted" />
        <Figure>SM-S938B</Figure>
      </div>
      <Link
        href={routes.model(ref.brand.slug, ref.series.slug, ref.model.slug)}
        className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 hover:bg-ig-blue-wash"
      >
        <span>
          <span className="block txt-compact-small-plus">{ref.model.name}</span>
          <Figure className="txt-compact-small text-ui-fg-muted">{ref.model.codes.join(" · ")}</Figure>
        </span>
        <span className="txt-compact-small text-ui-fg-subtle"><Figure>{parts}</Figure> parts fit</span>
      </Link>
    </div>
  )
}

export function GradeFragment() {
  const siblings = PRODUCTS.filter((p) => p.category === "screens" && p.models.includes("iphone-17-pro-max"))
  return (
    <ul data-ui className={`${frame} flex flex-col gap-2`}>
      {siblings.slice(0, 4).map((p) => (
        <li key={p.slug}>
          <Link href={routes.product(p.slug)} className="grid grid-cols-[150px_1fr] items-center gap-4 rounded-xl bg-white px-4 py-3 hover:bg-ig-blue-wash">
            <GradeBadge grade={p.grade!} className="w-fit" />
            <GradeScale grade={p.grade!} />
          </Link>
        </li>
      ))}
      <li className="px-1 pt-1 txt-compact-small text-ui-fg-subtle">
        iPhone 17 Pro Max screen in {siblings.length} grades, from {gradeById(siblings[0].grade!).label.toLowerCase()} to{" "}
        {gradeById(siblings[siblings.length - 1].grade!).label.toLowerCase()}
      </li>
    </ul>
  )
}

export function PriceFragment() {
  const rows = ["1–4", "5–9", "10–24", "25+"]
  return (
    <div data-ui className={frame}>
      <div className="overflow-hidden rounded-xl bg-white">
        <div className="grid grid-cols-2 px-4 py-2 txt-compact-small-plus text-ui-fg-muted">
          <span>Quantity</span>
          <span className="text-right">Your price</span>
        </div>
        {rows.map((r) => (
          <div key={r} className="grid grid-cols-2 px-4 py-2.5 txt-compact-small odd:bg-ui-bg-subtle">
            <Figure>{r}</Figure>
            <span className="flex items-center justify-end gap-1.5 text-ui-fg-subtle">
              <LockClosedSolid className="text-ui-fg-muted" /> After approval
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ShipFragment() {
  return (
    <div data-ui className={`${frame} flex items-center gap-4`}>
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ig-blue text-white">
        <Clock />
      </span>
      <span className="txt-medium-plus text-ig-ink"><CutoffCountdown /></span>
    </div>
  )
}
