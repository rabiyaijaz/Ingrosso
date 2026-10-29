"use client"

import { useState } from "react"
import { clx } from "@medusajs/ui"
import { GRADES } from "@/lib/catalog"
import { FAMILIES, FAMILY_ICON, GradeIcon } from "@/components/catalog/Grade"

// The three grade families as clear tabs, the same switch as the grade tabs on
// part listings: a soft track, each family with its glass icon and a short
// note, the chosen one as a white card. The list below changes in place.
export function GradeTabs() {
  const [family, setFamily] = useState<(typeof FAMILIES)[number]>("Genuine")
  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label="Grade family" className="grid grid-cols-1 gap-1.5 rounded-[22px] bg-[color-mix(in_srgb,var(--fg-base)_5%,transparent)] p-1.5 sm:grid-cols-3">
        {FAMILIES.map((f) => {
          const on = f === family
          const Icon = FAMILY_ICON[f]
          const count = GRADES.filter((g) => g.family === f).length
          return (
            <button
              key={f}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls="grade-panel"
              onClick={() => setFamily(f)}
              className={clx(
                "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left outline-none transition-[background-color,box-shadow] focus-visible:shadow-borders-focus",
                on
                  ? "bg-ui-bg-base shadow-[0_0_0_1.5px_color-mix(in_srgb,var(--ig-blue)_45%,transparent),0_8px_20px_-12px_var(--ig-blue)]"
                  : "hover:bg-[color-mix(in_srgb,var(--bg-base)_70%,transparent)]"
              )}
            >
              <span className="ig-icon-frame ig-glass-icon" data-size="md" data-family={f}><Icon /></span>
              <span className="flex min-w-0 flex-col">
                <span className={clx("txt-compact-medium-plus", on ? "text-ig-ink" : "text-ig-ink-soft group-hover:text-ig-ink")}>{f}</span>
                {/* Count only: this column is too narrow for the note without cutting it off */}
                <span className="txt-compact-xsmall text-ig-ink-soft">{count} grades</span>
              </span>
            </button>
          )
        })}
      </div>
      <ul id="grade-panel" role="tabpanel" className="flex flex-col gap-5">
        {GRADES.filter((g) => g.family === family).map((g) => (
          <li key={g.id} className="flex items-center gap-4">
            <GradeIcon grade={g.id} size="md" />
            <span>
              <span className="block text-[18px] font-medium leading-7 text-ig-ink">{g.label}</span>
              <span className="block max-w-[44ch] text-[15px] leading-6 text-ig-ink-soft">{g.summary}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
