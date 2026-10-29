"use client"

import Link from "next/link"
import { useState } from "react"
import { Select, clx } from "@medusajs/ui"
import { Button } from "@/components/ui/Button"
import { ArrowRight, CheckMini, ChevronRight } from "@medusajs/icons"
import { BrandMark } from "@/components/brand/BrandMark"
import type { DeviceTree } from "@/lib/public"
import { routes } from "@/lib/routes"

type Props = {
  tree: DeviceTree
  variant?: "columns" | "select"
  buttonVariant?: "primary" | "secondary"
  onNavigate?: () => void
  className?: string
  /** Open at this brand and series (the brand and series pages) */
  initialBrand?: string
  initialSeries?: string
  /** Pick several models instead of linking to one (trade desk, Add product) */
  pick?: { selected: string[]; onToggle: (slugs: string[]) => void }
}

// Brand → Series → Model, the primary way into the catalogue (CAT-01).
// "columns" for the device menu and devices page, "select" for compact spots.
export function DeviceFinder({ tree, variant = "columns", buttonVariant = "primary", onNavigate, className, initialBrand, initialSeries, pick }: Props) {
  const [brand, setBrand] = useState<string | undefined>(initialBrand ?? tree[0]?.slug)
  const b = tree.find((x) => x.slug === brand) ?? tree[0]
  const [series, setSeries] = useState<string | undefined>(initialSeries ?? b?.series[0]?.slug)
  const s = b?.series.find((x) => x.slug === series) ?? b?.series[0]
  const [model, setModel] = useState<string | undefined>(s?.models[0]?.slug)
  const m = s?.models.find((x) => x.slug === model) ?? s?.models[0]

  const pickBrand = (slug: string) => {
    const nb = tree.find((x) => x.slug === slug)!
    setBrand(slug)
    setSeries(nb.series[0]?.slug)
    setModel(nb.series[0]?.models[0]?.slug)
  }
  const pickSeries = (slug: string) => {
    setSeries(slug)
    setModel(b.series.find((x) => x.slug === slug)?.models[0]?.slug)
  }

  if (variant === "select") {
    return (
      <div className={clx("flex flex-col gap-3", className)}>
        <div className="grid grid-cols-2 gap-2">
          <Select value={b.slug} onValueChange={pickBrand}>
            <Select.Trigger aria-label="Brand"><Select.Value /></Select.Trigger>
            <Select.Content>
              {tree.map((x) => (
                <Select.Item key={x.slug} value={x.slug}>
                  <span className="flex items-center gap-2">
                    <BrandMark brand={x.slug} variant="plain" />
                    {x.name}
                  </span>
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Select value={s?.slug} onValueChange={pickSeries}>
            <Select.Trigger aria-label="Series"><Select.Value /></Select.Trigger>
            <Select.Content>
              {b.series.map((x) => <Select.Item key={x.slug} value={x.slug}>{x.name}</Select.Item>)}
            </Select.Content>
          </Select>
          <Select value={m?.slug} onValueChange={setModel}>
            <Select.Trigger aria-label="Model" className="col-span-2"><Select.Value /></Select.Trigger>
            <Select.Content>
              {s?.models.map((x) => <Select.Item key={x.slug} value={x.slug}>{x.name}</Select.Item>)}
            </Select.Content>
          </Select>
        </div>
        {m && (
          <Button asChild size="large" variant={buttonVariant} iconLeft={<BrandMark brand={b.slug} variant="plain" />} iconRight={<ArrowRight />} className="w-full sm:w-auto sm:self-start">
            <Link href={routes.model(b.slug, s!.slug, m.slug)} onClick={onNavigate}>
              Show {m.parts} parts for {m.name}
            </Link>
          </Button>
        )}
      </div>
    )
  }

  const col = "flex flex-col gap-0.5"
  const item = (on: boolean) =>
    clx(
      "flex h-9 w-full items-center justify-between gap-2 rounded-md px-3 text-left txt-compact-small transition-colors",
      on ? "bg-ui-bg-highlight text-ui-fg-interactive" : "text-ui-fg-base hover:bg-ui-bg-base-hover"
    )
  // In pick mode each brand and series shows how many of its models are picked
  const picked = (slugs: string[]) => (pick ? slugs.filter((x) => pick.selected.includes(x)).length : 0)
  const end = (n: number) => (
    <span className="flex items-center gap-1.5">
      {n > 0 && <span className="ig-figure txt-compact-xsmall-plus text-ui-fg-interactive">{n}</span>}
      <ChevronRight className="text-ui-fg-muted" />
    </span>
  )
  const seriesSlugs = s?.models.map((x) => x.slug) ?? []
  const wholeSeries = seriesSlugs.length > 0 && picked(seriesSlugs) === seriesSlugs.length

  return (
    <div className={clx("grid grid-cols-1 gap-6 md:grid-cols-[180px_200px_1fr]", className)}>
      <nav aria-label="Brand" className={col}>
        <p className="mb-1 px-3 txt-compact-xsmall-plus text-ui-fg-muted">Brand</p>
        {tree.map((x) => (
          <button key={x.slug} type="button" className={clx(item(x.slug === b.slug), "group h-11 pl-1.5")} onMouseEnter={() => pickBrand(x.slug)} onFocus={() => pickBrand(x.slug)} onClick={() => pickBrand(x.slug)} aria-pressed={x.slug === b.slug}>
            <span className="flex items-center gap-2.5">
              <BrandMark brand={x.slug} size="sm" />
              {x.name}
            </span>
            {end(picked(x.series.flatMap((y) => y.models.map((z) => z.slug))))}
          </button>
        ))}
      </nav>
      <nav aria-label="Series" className={col}>
        <p className="mb-1 px-3 txt-compact-xsmall-plus text-ui-fg-muted">Series</p>
        {b.series.map((x) => (
          <button key={x.slug} type="button" className={item(x.slug === s?.slug)} onMouseEnter={() => pickSeries(x.slug)} onFocus={() => pickSeries(x.slug)} onClick={() => pickSeries(x.slug)} aria-pressed={x.slug === s?.slug}>
            {x.name}
            {end(picked(x.models.map((z) => z.slug)))}
          </button>
        ))}
      </nav>
      <nav aria-label="Model">
        <p className="mb-1 px-3 txt-compact-xsmall-plus text-ui-fg-muted">Model</p>
        <ul className={clx("grid grid-cols-1 gap-0.5", pick ? "2xl:grid-cols-2" : "sm:grid-cols-2")}>
          {s?.models.map((x) => pick ? (
            <li key={x.slug}>
              <PickRow on={pick.selected.includes(x.slug)} name={x.name} codes={x.codes} onClick={() => pick.onToggle([x.slug])} />
            </li>
          ) : (
            <li key={x.slug}>
              <Link
                href={routes.model(b.slug, s.slug, x.slug)}
                onClick={onNavigate}
                className="group flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-ui-bg-base-hover focus-visible:shadow-borders-focus outline-none"
              >
                <span>
                  <span className="block txt-compact-small-plus text-ui-fg-base group-hover:text-ui-fg-interactive">{x.name}</span>
                  <span className="ig-figure block txt-compact-xsmall text-ui-fg-muted">{x.codes.join(" · ")}</span>
                </span>
                <span className="ig-figure txt-compact-xsmall text-ui-fg-subtle">{x.parts} parts</span>
              </Link>
            </li>
          ))}
        </ul>
        {pick && s ? (
          <button
            type="button"
            onClick={() => pick.onToggle(wholeSeries ? seriesSlugs : seriesSlugs.filter((x) => !pick.selected.includes(x)))}
            className="mt-3 inline-flex items-center gap-1 px-3 txt-compact-small-plus text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
          >
            {wholeSeries ? `Clear ${s.name}` : `Pick the whole ${s.name} series`}
          </button>
        ) : s && !(b.slug === initialBrand && s.slug === initialSeries) && (
          <Link href={routes.series(b.slug, s.slug)} onClick={onNavigate} className="mt-3 inline-flex items-center gap-1 px-3 txt-compact-small-plus text-ui-fg-interactive hover:text-ui-fg-interactive-hover">
            All {s.name} models <ArrowRight />
          </Link>
        )}
      </nav>
    </div>
  )
}

// A model row with a tick box, for pick mode
function PickRow({ on, name, codes, onClick }: { on: boolean; name: string; codes: string[]; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={clx(
        "group flex w-full items-center gap-3 rounded-md px-3 py-2 text-left outline-none transition-colors focus-visible:shadow-borders-focus",
        on ? "bg-ui-bg-highlight" : "hover:bg-ui-bg-base-hover"
      )}
    >
      <span
        aria-hidden
        className={clx(
          "grid size-4 shrink-0 place-items-center rounded-[5px] transition-colors",
          on ? "bg-ui-bg-interactive text-ui-fg-on-color" : "bg-ui-bg-base shadow-borders-base"
        )}
      >
        {on && <CheckMini />}
      </span>
      <span>
        <span className={clx("block txt-compact-small-plus", on ? "text-ui-fg-interactive" : "text-ui-fg-base")}>{name}</span>
        <span className="ig-figure block txt-compact-xsmall text-ui-fg-muted">{codes.join(" · ")}</span>
      </span>
    </button>
  )
}
