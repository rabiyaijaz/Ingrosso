"use client"

import { useState } from "react"
import { clx } from "@medusajs/ui"
import { GRADES } from "@/lib/catalog"
import { FAMILIES, FAMILY_ICON, GradeIcon } from "@/components/catalog/Grade"

// The three grade families as icon tabs (.ig-icontabs), the same control as the
// grade tabs on part listings. The list below changes in place.
export function GradeTabs() {
  const [family, setFamily] = useState<(typeof FAMILIES)[number]>("Genuine")
  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label="Grade family" className="ig-icontabs grid-cols-1 sm:grid-cols-3">
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
              className="ig-icontabs__tab"
            >
              <span className="ig-icon-frame ig-glass-icon" data-size="md" data-family={f}><Icon /></span>
              <span className="flex min-w-0 flex-col">
                <span className="ig-icontabs__label txt-compact-medium-plus">{f}</span>
                {/* Count only: this column is too narrow for the note without cutting it off */}
                <span className="ig-icontabs__note txt-compact-xsmall">{count} grades</span>
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
