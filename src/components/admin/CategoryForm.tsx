"use client"

import { useState } from "react"
import { clx } from "@medusajs/ui"
import { deleteCategory, saveCategory } from "@/app/admin-actions"
import { GLYPH_KEYS, PartGlassGlyph } from "@/components/catalog/PartIcon"
import { Tag } from "@medusajs/icons"
import { Button } from "@/components/ui/Button"
import { WithIcon } from "@/components/ui/WithIcon"
import type { AdminCategory } from "@/lib/admin/types"
import { Field, fieldClass } from "./Fields"

const ICON_NAME: Record<string, string> = {
  screens: "Screen",
  batteries: "Battery",
  "charging-ports": "Port",
  cameras: "Camera",
  "back-glass": "Back",
  "small-parts": "Screw",
  tools: "Tool",
}

// Add or edit one category. A live pill shows how it will sit in the
// store's top bar. Posts to a server action, so it works without JavaScript.
export function CategoryForm({ category, error, canDelete, deleteReason }: { category: AdminCategory; error?: string; canDelete: boolean; deleteReason?: string }) {
  const [plural, setPlural] = useState(category.plural)
  const [icon, setIcon] = useState(category.icon)
  const [visible, setVisible] = useState(category.visible)
  const isNew = category.slug === "new"

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <form action={saveCategory} className="flex flex-col gap-4">
        <input type="hidden" name="slug" value={category.slug} />
        <section className="flex flex-col gap-4 rounded-2xl bg-ui-bg-base p-5 shadow-elevation-card-rest">
          <h2 className="txt-compact-medium-plus">Names</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category name" hint="In the top bar and as the page title." error={error === "name" ? "Give the category a name." : undefined} htmlFor="plural">
              <WithIcon icon={<Tag />}><input id="plural" name="plural" value={plural} onChange={(e) => setPlural(e.target.value)} placeholder="For example Speakers" className={fieldClass} required /></WithIcon>
            </Field>
            <Field label="One item is called" hint="Used in part names and specs." htmlFor="name">
              <WithIcon icon={<Tag />}><input id="name" name="name" defaultValue={category.name} placeholder="For example Loudspeaker module" className={fieldClass} /></WithIcon>
            </Field>
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl bg-ui-bg-base p-5 shadow-elevation-card-rest">
          <h2 className="txt-compact-medium-plus">Icon</h2>
          <div role="radiogroup" aria-label="Icon" className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {GLYPH_KEYS.map((k) => {
              const on = k === icon
              return (
                <label
                  key={k}
                  className={clx(
                    "flex cursor-pointer flex-col items-center gap-1.5 rounded-xl p-2.5 txt-compact-xsmall transition-shadow",
                    on ? "bg-ui-bg-highlight text-ui-fg-base shadow-borders-interactive-with-active" : "text-ui-fg-subtle shadow-borders-base hover:bg-ui-bg-base-hover"
                  )}
                >
                  <input type="radio" name="icon" value={k} checked={on} onChange={() => setIcon(k)} className="sr-only" />
                  <span className="ig-icon-frame ig-glass-icon" data-size="md"><PartGlassGlyph category={k} /></span>
                  {ICON_NAME[k] ?? k}
                </label>
              )
            })}
          </div>
        </section>

        <section className="flex items-center justify-between gap-4 rounded-2xl bg-ui-bg-base p-5 shadow-elevation-card-rest">
          <div>
            <h2 className="txt-compact-medium-plus">Show in the store</h2>
            <p className="txt-compact-small text-ui-fg-subtle">Hidden categories keep their parts but leave the top bar.</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" name="visible" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="peer sr-only" />
            <span className="h-6 w-11 rounded-full bg-ui-bg-switch-off transition-colors peer-checked:bg-ig-blue peer-focus-visible:shadow-borders-focus" />
            <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
            <span className="sr-only">Show in the store's top bar</span>
          </label>
        </section>

        <div className="flex gap-2">
          <Button type="submit" size="lg">{isNew ? "Add category" : "Save category"}</Button>
        </div>
      </form>

      <aside className="flex flex-col gap-4 xl:sticky xl:top-6 xl:self-start">
        <section className="flex flex-col gap-3 rounded-2xl bg-ui-bg-base p-5 shadow-elevation-card-rest">
          <h2 className="txt-compact-medium-plus">In the top bar</h2>
          <div className="ig-catbar flex h-12 items-center rounded-xl px-2">
            <span className={clx("flex h-9 items-center gap-2 rounded-full pl-2 pr-3.5 txt-compact-medium-plus", visible ? "bg-ig-blue text-ig-on-accent" : "text-ui-fg-muted line-through")}>
              <PartGlassGlyph category={icon} className="size-[18px]" />
              {plural || "Category name"}
            </span>
          </div>
          <p className="txt-compact-small text-ui-fg-subtle">{visible ? "Shown as the selected pill, on its own page." : "Hidden from the top bar."}</p>
        </section>
        {!isNew && (
          <form action={deleteCategory} className="flex flex-col gap-2 rounded-2xl bg-ui-bg-base p-4 shadow-elevation-card-rest">
            <input type="hidden" name="slug" value={category.slug} />
            <Button type="submit" variant="danger" size="sm" disabled={!canDelete} className="w-fit">Delete category</Button>
            {!canDelete && <p className="txt-compact-small text-ui-fg-subtle">{deleteReason}</p>}
          </form>
        )}
      </aside>
    </div>
  )
}
