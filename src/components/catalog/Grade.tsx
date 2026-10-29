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
  BadgeCheck,
} from "@medusajs/icons"
import { GRADES, gradeById, type Grade, type GradeId } from "@/lib/catalog"

// Each grade has an icon that says what the grade is. Its family sets the
// tile: Genuine is filled with the accent, Aftermarket is an accent wash,
// Third-party is neutral. Icon, tile and label together carry the meaning,
// so nothing depends on telling shades of one colour apart.
const ICONS: Record<GradeId, React.ComponentType<{ className?: string }>> = {
  service_pack: ArchiveBox, // sealed service packaging
  service_pack_preassembled: StackPerspective, // frame and adhesive fitted
  original: BadgeCheck, // genuine manufacturer part
  pulled: ArrowUturnLeft, // taken from a device
  oem: Buildings, // made by the manufacturer's own supplier
  soft_oled: Sparkles, // closest aftermarket match
  hard_oled: Sun, // rigid OLED panel
  refurbished: ArrowPath, // renewed and retested
  in_cell: GridLayout, // LCD pixel panel
  compatible: Puzzle, // third-party part made to fit
}

export const FAMILIES: Grade["family"][] = ["Genuine", "Aftermarket", "Third-party"]

// The grade's glass icon, in the shared rounded-square icon frame
// (.ig-icon-frame + .ig-glass-icon in globals.css). `bare` drops the frame
// for use inside pill buttons and chips (.ig-icon-bare): the glyph alone,
// tinted by family, or the chip's own colour when the chip is selected.
export function GradeIcon({
  grade,
  size = "sm",
  bare,
  className,
}: {
  grade: GradeId
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  bare?: boolean
  className?: string
}) {
  const g = gradeById(grade)
  const Icon = ICONS[grade]
  if (bare) {
    return (
      <span aria-hidden data-family={g.family} className={clx("ig-icon-bare", className)}>
        <Icon />
      </span>
    )
  }
  return (
    <span aria-hidden data-family={g.family} data-size={size} className={clx("ig-icon-frame ig-glass-icon", className)}>
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
      <GradeIcon grade={grade} size="xs" />
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
