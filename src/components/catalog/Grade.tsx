import { clx } from "@medusajs/ui"
import {
  ArchiveBox,
  ArrowPath,
  ArrowUturnLeft,
  Buildings,
  GridLayout,
  Puzzle,
  Sparkles,
  StackPerspective,
  Sun,
  VerifiedBadge,
} from "@medusajs/icons"
import { GRADES, gradeById, type Grade, type GradeId } from "@/lib/catalog"

// Each grade has an icon that says what the grade is. Its family sets the
// tile: Genuine is filled with the accent, Aftermarket is an accent wash,
// Third-party is neutral. Icon, tile and label together carry the meaning,
// so nothing depends on telling shades of one colour apart.
const ICONS: Record<GradeId, React.ComponentType<{ className?: string }>> = {
  service_pack: ArchiveBox, // sealed service packaging
  service_pack_preassembled: StackPerspective, // frame and adhesive fitted
  original: VerifiedBadge, // genuine manufacturer part
  pulled: ArrowUturnLeft, // taken from a device
  oem: Buildings, // made by the manufacturer's own supplier
  soft_oled: Sparkles, // closest aftermarket match
  hard_oled: Sun, // rigid OLED panel
  refurbished: ArrowPath, // renewed and retested
  in_cell: GridLayout, // LCD pixel panel
  compatible: Puzzle, // third-party part made to fit
}

export const FAMILIES: Grade["family"][] = ["Genuine", "Aftermarket", "Third-party"]

const TILE: Record<Grade["family"], string> = {
  Genuine: "bg-ig-blue text-ig-on-accent",
  Aftermarket: "bg-ig-blue-wash text-ig-blue",
  "Third-party": "bg-ui-bg-component text-ui-fg-subtle",
}

export function GradeIcon({ grade, size = "sm", className }: { grade: GradeId; size?: "xs" | "sm" | "md" | "lg"; className?: string }) {
  const g = gradeById(grade)
  const Icon = ICONS[grade]
  const box = { xs: "size-4 rounded-[4px] [&_svg]:size-3", sm: "size-5 rounded-[5px] [&_svg]:size-3.5", md: "size-7 rounded-md [&_svg]:size-4", lg: "size-11 rounded-lg [&_svg]:size-6" }[size]
  return (
    <span aria-hidden className={clx("inline-grid shrink-0 place-items-center", box, TILE[g.family], className)}>
      <Icon />
    </span>
  )
}

// Compact grade label with its icon.
export function GradeBadge({ grade, className }: { grade: GradeId; className?: string }) {
  const g = gradeById(grade)
  return (
    <span
      className={clx(
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-md bg-ui-bg-subtle pl-0.5 pr-2 txt-compact-xsmall-plus text-ui-fg-base",
        className
      )}
    >
      <GradeIcon grade={grade} size="sm" />
      {g.label}
    </span>
  )
}

// Where a grade sits on the ten-step ladder, grouped by family.
export function GradeScale({ grade, size = "sm", className }: { grade: GradeId; size?: "sm" | "lg"; className?: string }) {
  const g = gradeById(grade)
  return (
    <div className={clx("flex flex-col gap-1.5", className)}>
      <div className={clx("flex", size === "lg" ? "gap-2" : "gap-1")} role="img" aria-label={`${g.label}: step ${g.rank} of 10, ${g.family.toLowerCase()}`}>
        {FAMILIES.map((f) => {
          const steps = GRADES.filter((s) => s.family === f)
          return (
            <div key={f} className="flex gap-[3px]" style={{ flex: steps.length }}>
              {steps.map((s) => (
                <span
                  key={s.id}
                  className={clx("flex-1 rounded-[2px]", size === "lg" ? "h-2.5" : "h-1.5", s.id === grade ? "bg-ig-blue" : "bg-ui-border-base")}
                  style={s.id === grade ? { transform: "scaleY(1.6)" } : undefined}
                />
              ))}
            </div>
          )
        })}
      </div>
      {size === "lg" && (
        <div className="flex gap-2 txt-compact-xsmall text-ui-fg-muted">
          {FAMILIES.map((f) => (
            <span key={f} style={{ flex: GRADES.filter((s) => s.family === f).length }} className={clx(f === g.family && "text-ui-fg-base")}>
              {f}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
