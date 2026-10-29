import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MagnifyingGlass } from "@medusajs/icons"
import { BrandMark } from "@/components/brand/BrandMark"
import { Breadcrumbs, PageContainer, PageHeading } from "@/components/layout/Page"
import { GlassTile } from "@/components/marketing/GlassTile"
import { BRANDS, PRODUCTS } from "@/lib/catalog"
import { getCategories } from "@/lib/categories"
import { routes } from "@/lib/routes"
import { BRAND_IMAGE, CATEGORY_IMAGE } from "@/lib/visuals"

export const metadata = { title: "All parts" }

// Every part category at a glance, with the same 3D tiles as the landing
// page, in the order and names the trade desk set. Both ways in sit on one
// page: search by model or SKU at the top, shop by device at the bottom.
export default async function PartsPage() {
  const categories = (await getCategories()).filter((c) => c.visible)
  const count = (slug: string) => PRODUCTS.filter((p) => p.category === slug).length

  return (
    <PageContainer className="flex flex-col gap-8 pt-6">
      <Breadcrumbs items={[{ label: "Parts" }]} />
      <PageHeading title="All parts" description={`${PRODUCTS.length} parts in ${categories.length} categories, every one in its real grade.`}>
        <form action={routes.search("")} method="get" role="search" className="relative w-full md:w-[340px]">
          <MagnifyingGlass aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-muted" />
          <input
            type="search"
            name="q"
            aria-label="Search all parts"
            placeholder="Model, code or SKU"
            className="h-10 w-full rounded-full bg-ui-bg-field pl-9 pr-3 txt-compact-small text-ui-fg-base shadow-borders-base outline-none transition-shadow placeholder:text-ui-fg-muted hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active"
          />
        </form>
      </PageHeading>

      {/* Start from the handset: one glass card per brand with its 3D device render */}
      <section aria-labelledby="by-device" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="by-device" className="txt-large-plus">Start from the handset</h2>
          <Link href={routes.devices()} className="flex items-center gap-1 txt-compact-small-plus text-ui-fg-interactive hover:underline">
            All devices <ArrowRight />
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {BRANDS.map((b) => {
            const models = b.series.reduce((n, s) => n + s.models.length, 0)
            return (
              <li key={b.slug}>
                <Link href={routes.brand(b.slug)} className="ig-brand-card group">
                  <span className="relative z-[1] flex min-w-0 flex-col gap-1.5">
                    <BrandMark brand={b.slug} size="xs" />
                    <span className="flex flex-col">
                      <span className="txt-compact-medium-plus text-ui-fg-base">{b.name}</span>
                      <span className="txt-compact-small text-ui-fg-subtle">{models} models · {b.series.length} series</span>
                    </span>
                    <span className="mt-auto flex items-center gap-1 txt-compact-small-plus text-ui-fg-interactive">
                      Choose a model <ArrowRight className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </span>
                  {BRAND_IMAGE[b.slug] && (
                    <Image src={BRAND_IMAGE[b.slug]} alt="" width={168} height={168} sizes="84px" className="ig-brand-card__img" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="by-part" className="flex flex-col gap-3">
        <h2 id="by-part" className="txt-large-plus">Or browse by part</h2>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {categories.map((c) => (
            <li key={c.slug}>
              <GlassTile
                href={routes.category(c.slug)}
                src={CATEGORY_IMAGE[c.slug] ?? CATEGORY_IMAGE.tools}
                label={c.plural}
                detail={`${count(c.slug)} part${count(c.slug) === 1 ? "" : "s"}`}
              />
            </li>
          ))}
        </ul>
      </section>    </PageContainer>
  )
}
