"use client"

import Link from "next/link"
import { useState } from "react"
import { Select, clx } from "@medusajs/ui"
import { Button } from "@/components/ui/Button"
import { ArrowRight, ChevronRight } from "@medusajs/icons"
import { BrandMark } from "@/components/brand/BrandMark"
import type { DeviceTree } from "@/lib/public"
import { routes } from "@/lib/routes"

type Props = {
  tree: DeviceTree
  variant?: "columns" | "select"
  buttonVariant?: "primary" | "secondary"
  onNavigate?: () => void
  className?: string
}

// Brand → Series → Model, the primary way into the catalogue (CAT-01).
// "columns" for the device menu and devices page, "select" for compact spots.
export function DeviceFinder({ tree, variant = "columns", buttonVariant = "primary", onNavigate, className }: Props) {
  const [brand, setBrand] = useState<string | undefined>(tree[0]?.slug)
  const b = tree.find((x) => x.slug === brand) ?? tree[0]
  const [series, setSeries] = useState<string | undefined>(b?.series[0]?.slug)
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
            <ChevronRight className="text-ui-fg-muted" />
          </button>
        ))}
      </nav>
      <nav aria-label="Series" className={col}>
        <p className="mb-1 px-3 txt-compact-xsmall-plus text-ui-fg-muted">Series</p>
        {b.series.map((x) => (
          <button key={x.slug} type="button" className={item(x.slug === s?.slug)} onMouseEnter={() => pickSeries(x.slug)} onFocus={() => pickSeries(x.slug)} onClick={() => pickSeries(x.slug)} aria-pressed={x.slug === s?.slug}>
            {x.name}
            <ChevronRight className="text-ui-fg-muted" />
          </button>
        ))}
      </nav>
      <nav aria-label="Model">
        <p className="mb-1 px-3 txt-compact-xsmall-plus text-ui-fg-muted">Model</p>
        <ul className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">
          {s?.models.map((x) => (
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
        {s && (
          <Link href={routes.series(b.slug, s.slug)} onClick={onNavigate} className="mt-3 inline-flex items-center gap-1 px-3 txt-compact-small-plus text-ui-fg-interactive hover:text-ui-fg-interactive-hover">
            All {s.name} models <ArrowRight />
          </Link>
        )}
      </nav>
    </div>
  )
}
