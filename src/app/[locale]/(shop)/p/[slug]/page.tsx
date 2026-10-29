import Link from "next/link"
import { chipClass } from "@/components/ui/Chip"
import { notFound } from "next/navigation"
import { Heading, Table, Text, clx } from "@medusajs/ui"
import { GradeBadge, GradeScale } from "@/components/catalog/Grade"
import { GradeCompare } from "@/components/catalog/GradeCompare"
import { PartImage } from "@/components/catalog/PartImage"
import { AddToOrder } from "@/components/commerce/AddToOrder"
import { Figure } from "@/components/commerce/Figure"
import { GateCallout } from "@/components/commerce/GateCallout"
import { PriceTag } from "@/components/commerce/PriceTag"
import { QuantityBreaks } from "@/components/commerce/QuantityBreaks"
import { StockTag } from "@/components/commerce/StockTag"
import { Breadcrumbs, PageContainer } from "@/components/layout/Page"
import { PRODUCTS, categoryBySlug, findModel, gradeById, productBySlug, productsForModel } from "@/lib/catalog"
import { readWatchList } from "@/lib/watch"
import { NotifyMe } from "@/components/commerce/NotifyMe"
import { ProductTable } from "@/components/catalog/ProductTable"
import { commercialView } from "@/lib/commerce"
import { routes } from "@/lib/routes"
import { getViewer } from "@/lib/viewer"

type Params = { locale: string; slug: string }

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  return { title: productBySlug((await params).slug)?.name ?? "Part" }
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const product = productBySlug((await params).slug)
  if (!product) notFound()
  const viewer = await getViewer()
  const view = commercialView(product, viewer)
  const category = categoryBySlug(product.category)!
  const fits = product.models.map(findModel).filter((r) => r !== undefined)
  const primary = fits[0]
  const grade = product.grade ? gradeById(product.grade) : null
  const siblings = primary
    ? PRODUCTS.filter((p) => p.category === product.category && p.models.includes(primary.model.slug))
    : []
  // The rest of the same repair job: other parts for this model, one per category, in stock first
  const inStock = (p: (typeof PRODUCTS)[number]) => Number(commercialView(p, viewer).stock.kind !== "out")
  const alsoFor = primary
    ? [...new Set(productsForModel(primary.model.slug).map((p) => p.category))]
        .filter((c) => c !== product.category)
        .map((c) => productsForModel(primary.model.slug).filter((p) => p.category === c).sort((a, b) => inStock(b) - inStock(a))[0])
        .slice(0, 5)
    : []
  const watching = await readWatchList()

  return (
    <PageContainer className="flex flex-col gap-12 pt-6">
      <Breadcrumbs
        items={
          primary
            ? [
                { label: primary.brand.name, href: routes.brand(primary.brand.slug) },
                { label: primary.series.name, href: routes.series(primary.brand.slug, primary.series.slug) },
                { label: primary.model.name, href: routes.model(primary.brand.slug, primary.series.slug, primary.model.slug) },
                { label: category.plural, href: routes.model(primary.brand.slug, primary.series.slug, primary.model.slug, { cat: category.slug }) },
              ]
            : [{ label: category.plural, href: routes.category(category.slug) }, { label: product.name }]
        }
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="relative grid aspect-[16/9] max-h-[320px] place-items-center overflow-hidden rounded-panel bg-ui-bg-subtle lg:sticky lg:top-6 lg:aspect-square lg:max-h-none lg:self-start">
          <span aria-hidden className="ig-part-stage" />
          <PartImage render product={product} size={560} className="relative size-[72%]" label={`Illustration of a ${category.name.toLowerCase()}`} />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            {grade && <GradeBadge grade={grade.id} className="w-fit" />}
            <Heading level="h1" data-size="compact" className="ig-page-title">{product.name}</Heading>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 txt-compact-small text-ui-fg-subtle">
              <span>SKU <Figure className="text-ui-fg-base">{product.sku}</Figure></span>
              <StockTag view={view.stock} />
            </div>
          </div>

          {grade && (
            <div className="ig-inset flex flex-col gap-3 p-5">
              <GradeScale grade={grade.id} size="lg" />
              <Text size="small" className="text-ui-fg-subtle">
                <span className="text-ui-fg-base">{grade.label}.</span> {grade.summary}{" "}
                <Link href={routes.grades()} className="text-ui-fg-interactive hover:underline">How we grade</Link>
              </Text>
            </div>
          )}

          {view.price.kind === "gated" ? (
            <GateCallout state={viewer.state} next={routes.product(product.slug)} />
          ) : (
            <div className="ig-card flex flex-col gap-5 p-5">
              <PriceTag view={view.price} size="lg" />
              {view.stock.kind === "out" ? (
                <div className="flex flex-col items-start gap-3">
                  <Text size="small" className="text-ui-fg-subtle">Out of stock. Compare the other grades below for one that ships today, or get an email when this one is back.</Text>
                  <NotifyMe slug={product.slug} name={product.name} watching={watching.includes(product.slug)} />
                </div>
              ) : (
                <AddToOrder
                  slug={product.slug}
                  name={product.name}
                  orderStep={view.orderStep}
                  breaks={view.price.kind === "priced" ? view.price.breaks : null}
                  maxAvailable={view.stock.kind === "count" ? view.stock.available : null}
                />
              )}
              {view.price.kind === "priced" && view.price.breaks.length > 1 && <QuantityBreaks breaks={view.price.breaks} />}
            </div>
          )}

          <section className="flex flex-col gap-3">
            <Heading level="h2" className="txt-large-plus">Specifications</Heading>
            <Table>
              <Table.Body>
                {product.specs.map(([k, v]) => (
                  <Table.Row key={k}>
                    <Table.Cell className="w-[40%] text-ui-fg-subtle">{k}</Table.Cell>
                    <Table.Cell className="whitespace-normal">{v}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </section>

          {fits.length > 0 && (
            <section className="flex flex-col gap-3">
              <Heading level="h2" className="txt-large-plus">Fits</Heading>
              <ul className="flex flex-wrap gap-2">
                {fits.map((r) => (
                  <li key={r.model.slug}>
                    <Link
                      href={routes.model(r.brand.slug, r.series.slug, r.model.slug)}
                      className={clx(chipClass(), "gap-2")}
                    >
                      {r.model.name}
                      <Figure className="text-ui-fg-muted">{r.model.codes[0]}</Figure>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {siblings.length > 1 && primary && (
        <section className="flex flex-col gap-4">
          <div>
            <Heading level="h2" className="txt-xlarge-plus">
              Every grade of this {category.name.toLowerCase()}
            </Heading>
            <Text className="mt-1 text-ui-fg-subtle">The same repair on a {primary.model.name}, from genuine to third-party.</Text>
          </div>
          <GradeCompare current={product} siblings={siblings} viewer={viewer} />
        </section>
      )}

      {alsoFor.length > 0 && primary && (
        <section className="flex flex-col gap-4">
          <div>
            <Heading level="h2" className="txt-xlarge-plus">Also for the {primary.model.name}</Heading>
            <Text className="mt-1 text-ui-fg-subtle">Other parts for the same handset, to finish the repair in one order.</Text>
          </div>
          <ProductTable products={alsoFor} viewer={viewer} />
        </section>
      )}
    </PageContainer>
  )
}
