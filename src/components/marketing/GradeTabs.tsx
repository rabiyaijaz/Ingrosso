"use client"

import { useState } from "react"
import { clx } from "@medusajs/ui"
import { GRADES } from "@/lib/catalog"
import { GradeIcon } from "@/components/catalog/Grade"

const FAMILIES = ["Genuine", "Aftermarket", "Third-party"] as const

// Plain text tabs over the grade families; the list below changes in place.
export function GradeTabs() {
  const [family, setFamily] = useState<(typeof FAMILIES)[number]>("Genuine")
  return (
    <div className="flex flex-col gap-8">
      <div role="tablist" aria-label="Grade family" className="flex flex-wrap gap-x-7 gap-y-2">
        {FAMILIES.map((f) => (
          <button
            key={f}
            role="tab"
            type="button"
            aria-selected={f === family}
            aria-controls="grade-panel"
            onClick={() => setFamily(f)}
            className={clx(
              "text-[18px] leading-7 transition-colors outline-none focus-visible:underline",
              f === family ? "text-ig-ink font-medium" : "text-ig-ink-soft hover:text-ig-ink"
            )}
          >
            {f}
          </button>
        ))}
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
