import { clx } from "@medusajs/ui"
import { GRADES, gradeById, type GradeId } from "@/lib/catalog"

export const gradeColour = (rank: number) => `var(--ig-grade-${rank})`

// Compact grade label with its swatch from the grade ramp.
export function GradeBadge({ grade, className }: { grade: GradeId; className?: string }) {
  const g = gradeById(grade)
  return (
    <span
      className={clx(
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-md bg-ui-bg-subtle pl-1.5 pr-2 txt-compact-xsmall-plus text-ui-fg-base",
        className
      )}
    >
      <span aria-hidden className="size-3 rounded-[3px]" style={{ background: gradeColour(g.rank) }} />
      {g.label}
    </span>
  )
}

// Where a grade sits on the ten-step ladder, genuine to third-party.
export function GradeScale({ grade, size = "sm", className }: { grade: GradeId; size?: "sm" | "lg"; className?: string }) {
  const g = gradeById(grade)
  return (
    <div className={clx("flex flex-col gap-1.5", className)}>
      <div
        className="flex gap-[3px]"
        role="img"
        aria-label={`${g.label}: step ${g.rank} of 10, from genuine to third-party`}
      >
        {GRADES.map((step) => (
          <span
            key={step.id}
            className={clx("flex-1 rounded-[2px] transition-transform", size === "lg" ? "h-3" : "h-1.5")}
            style={{
              background: step.rank === g.rank ? gradeColour(step.rank) : "var(--border-base)",
              transform: step.rank === g.rank ? "scaleY(1.6)" : undefined,
            }}
          />
        ))}
      </div>
      {size === "lg" && (
        <div className="flex justify-between txt-compact-xsmall text-ui-fg-muted">
          <span>Genuine</span>
          <span>Aftermarket</span>
          <span>Third-party</span>
        </div>
      )}
    </div>
  )
}
