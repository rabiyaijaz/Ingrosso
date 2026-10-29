import { Heading, Text } from "@medusajs/ui"
import { ArrowRight, Plus, ShoppingCart } from "@medusajs/icons"
import { Button } from "@/components/ui/Button"
import { CheckDraw } from "@/components/ui/CheckDraw"
import { Chip } from "@/components/ui/Chip"
import { EmptyState } from "@/components/ui/EmptyState"
import { SearchField } from "@/components/ui/SearchField"
import { BrandMark } from "@/components/brand/BrandMark"
import { GradeBadge, GradeScale } from "@/components/catalog/Grade"
import { PartGlyph } from "@/components/catalog/PartGlyph"
import { Figure } from "@/components/commerce/Figure"
import { GateCallout } from "@/components/commerce/GateCallout"
import { PriceTag } from "@/components/commerce/PriceTag"
import { QuantityBreaks } from "@/components/commerce/QuantityBreaks"
import { StockTag } from "@/components/commerce/StockTag"
import { Logo } from "@/components/brand/Logo"
import { PageContainer, PageHeading } from "@/components/layout/Page"
import { PillLink } from "@/components/marketing/Primitives"
import { CATEGORIES, GRADES, productBySlug } from "@/lib/catalog"
import { commercialView } from "@/lib/commerce"
import { formatMoney } from "@/lib/money"
import { routes } from "@/lib/routes"

export const metadata = { title: "Design system" }

const TOKENS = [
  ["--ig-paper", "Paper"], ["--ig-paper-2", "Paper 2"], ["--ig-ink", "Ink"], ["--ig-ink-soft", "Ink soft"],
  ["--ig-blue", "Crystal blue"], ["--ig-blue-ink", "Blue ink"], ["--ig-blue-wash", "Blue wash"],
  ["--ig-slate", "Slate"], ["--ig-slate-2", "Slate 2"], ["--ig-on-slate", "On slate"],
]

// Living catalogue of every shared component and its states. Change a
// component or a token and it changes here and everywhere it is used.
export default function SystemPage() {
  const sample = productBySlug("iphone-17-pro-max-screen-service-pack")!
  const screws = productBySlug("iphone-17-series-bottom-pentalobe-screws")!
  const approved = commercialView(sample, { state: "approved", priceLists: ["trade-standard"] })

  return (
    <PageContainer className="flex flex-col gap-16 pt-10">
      <PageHeading title="Ingrosso design system" description="Medusa UI with Ingrosso tokens. Every component below is the one used in the app; tokens live in src/app/globals.css." />

      <Block title="Brand">
        <div className="flex flex-wrap items-center gap-8">
          <Logo href={null} />
          <Logo href={null} size="sm" />
          <span className="ig-surface-blue rounded-xl p-3"><Logo href={null} tone="dark" /></span>
        </div>
      </Block>

      <Block title="Colour tokens">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {TOKENS.map(([v, label]) => (
            <li key={v} className="flex flex-col gap-2">
              <span className="h-16 rounded-lg shadow-borders-base" style={{ background: `var(${v})` }} />
              <span className="txt-compact-small-plus">{label}</span>
              <Figure className="txt-compact-xsmall text-ui-fg-muted">{v}</Figure>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Grade ramp and badges">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2">{GRADES.map((g) => <GradeBadge key={g.id} grade={g.id} />)}</div>
          <GradeScale grade="pulled" size="lg" className="max-w-[420px]" />
        </div>
      </Block>

      <Block title="Price, every state">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <State label="Visitor"><PriceTag view={{ kind: "gated", reason: "visitor" }} /></State>
          <State label="Pending"><PriceTag view={{ kind: "gated", reason: "pending" }} /></State>
          <State label="Suspended"><PriceTag view={{ kind: "gated", reason: "suspended" }} /></State>
          <State label="Masked"><PriceTag view={{ kind: "masked" }} /></State>
          <State label="Approved"><PriceTag view={approved.price} /></State>
        </div>
        <Text size="small" className="mt-4 text-ui-fg-subtle">
          Four decimals when a price is below a cent: <Figure>{formatMoney(screws.commercial.lists["trade-standard"][0].unit)}</Figure>
        </Text>
      </Block>

      <Block title="Stock, three states">
        <div className="flex flex-wrap gap-8">
          <State label="Count"><StockTag view={{ kind: "count", available: 142 }} /></State>
          <State label="Hidden (not approved)"><StockTag view={{ kind: "hidden" }} /></State>
          <State label="Out of stock"><StockTag view={{ kind: "out" }} /></State>
        </div>
      </Block>

      <Block title="Quantity breaks">
        {approved.price.kind === "priced" && <QuantityBreaks breaks={approved.price.breaks} activeQty={10} className="max-w-[520px]" />}
      </Block>

      <Block title="Gate callouts">
        <div className="grid gap-4 lg:grid-cols-3">
          <GateCallout state="visitor" />
          <GateCallout state="pending" />
          <GateCallout state="suspended" />
        </div>
      </Block>

      <Block title="Part drawings">
        <ul className="flex flex-wrap gap-3">
          {CATEGORIES.map((c) => (
            <li key={c.slug} className="flex flex-col items-center gap-2">
              <span className="grid size-20 place-items-center rounded-lg bg-ui-bg-subtle"><PartGlyph category={c.slug} className="size-14" /></span>
              <span className="txt-compact-xsmall text-ui-fg-subtle">{c.plural}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Buttons">
        <div className="flex flex-col gap-8">
          <Text size="small" className="max-w-[70ch] text-ui-fg-subtle">
            One Button component (components/ui/Button) for every button and button-styled link. Always a pill. Primary
            buttons at large and extra-large sizes burst on press; try them.
          </Text>
          {(["primary", "secondary", "ghost", "danger"] as const).map((v) => (
            <div key={v} className="flex flex-col gap-3">
              <span className="txt-compact-small-plus capitalize text-ui-fg-subtle">{v}</span>
              <div className="flex flex-wrap items-center gap-3">
                {(["sm", "md", "lg", "xl"] as const).map((s) => (
                  <Button key={s} variant={v} size={s}>Size {s}</Button>
                ))}
                <Button variant={v} iconLeft={<ShoppingCart />}>Icon left</Button>
                <Button variant={v} iconRight={<ArrowRight />}>Icon right</Button>
                <Button variant={v} iconLeft={<Plus />} iconRight={<ArrowRight />}>Both</Button>
                <Button variant={v} iconOnly iconLeft={<ShoppingCart />} aria-label="Icon only" />
                <Button variant={v} isLoading>Loading</Button>
              </div>
            </div>
          ))}
          <div className="flex flex-col gap-3">
            <span className="txt-compact-small-plus text-ui-fg-subtle">As links (marketing pages)</span>
            <div className="flex flex-wrap gap-3">
              <PillLink href={routes.apply()} iconRight={<ArrowRight />}>Blue</PillLink>
              <PillLink href={routes.apply()} tone="paper">White</PillLink>
            </div>
          </div>
        </div>
      </Block>

      <Block title="Device brands">
        <div className="flex flex-wrap items-center gap-6">
          {["apple", "samsung", "google", "xiaomi"].map((b) => (
            <span key={b} className="group flex items-center gap-3">
              <BrandMark brand={b} size="lg" />
              <BrandMark brand={b} size="md" />
              <BrandMark brand={b} size="sm" />
              <BrandMark brand={b} variant="plain" />
            </span>
          ))}
        </div>
      </Block>

      <Block title="Tabs">
        <Text size="small" className="-mt-3 text-ui-fg-subtle">Segmented tabs (.ig-steps) for steps and views; icon tabs (.ig-icontabs) for a few big choices with a note.</Text>
        <nav aria-label="Example views" data-fit className="ig-steps">
          <a href="#tabs" aria-current="page" className="ig-steps__tab txt-compact-small-plus">To fulfil <span className="ig-figure txt-compact-xsmall text-ui-fg-muted">10</span></a>
          <a href="#tabs" className="ig-steps__tab txt-compact-small-plus">Shipped <span className="ig-figure txt-compact-xsmall text-ui-fg-muted">24</span></a>
          <a href="#tabs" className="ig-steps__tab txt-compact-small-plus">All</a>
        </nav>
        <nav aria-label="Example families" className="ig-icontabs max-w-[640px] grid-cols-3">
          {(["Genuine", "Aftermarket", "Third-party"] as const).map((f, i) => (
            <a key={f} href="#tabs" aria-current={i === 0 ? "page" : undefined} className="ig-icontabs__tab">
              <span className="ig-icon-frame ig-glass-icon" data-size="md" data-family={f}><Plus /></span>
              <span className="flex flex-col"><span className="ig-icontabs__label txt-compact-medium-plus">{f}</span><span className="ig-icontabs__note txt-compact-xsmall">Note</span></span>
            </a>
          ))}
        </nav>
      </Block>

      <Block title="Chips, search, empty state">
        <div className="flex flex-wrap items-center gap-2">
          <Chip size="sm">Small</Chip>
          <Chip size="md">Medium</Chip>
          <Chip size="lg">Large</Chip>
          <Chip selected>Selected</Chip>
          <Chip static>Label</Chip>
        </div>
        <div className="flex flex-wrap gap-3">
          <SearchField aria-label="Example search" placeholder="Search, small" className="w-[260px]" />
          <SearchField size="md" aria-label="Example search, medium" placeholder="Search, medium" className="w-[260px]" />
        </div>
        <EmptyState title="Nothing here yet" icon={<ShoppingCart />} action={<Button variant="secondary">One action</Button>}>One line on what to do next.</EmptyState>
      </Block>

      <Block title="Cards and motion">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="ig-card p-5 txt-compact-small">.ig-card: every card and panel</div>
          <div className="ig-card ig-card-hover p-5 txt-compact-small">.ig-card-hover: lifts on hover</div>
          <div className="ig-card p-5 txt-compact-small"><div className="ig-inset p-3">.ig-inset inside a card</div></div>
        </div>
        <div className="flex flex-wrap items-center gap-6 txt-compact-small">
          <span className="flex items-center gap-2 text-ui-tag-green-icon"><CheckDraw className="size-6" /><span className="text-ui-fg-base">CheckDraw: done</span></span>
          <span className="flex w-40 flex-col gap-1"><span className="h-1.5 overflow-hidden rounded-full bg-ui-bg-component"><span className="ig-progress-fill block h-full w-2/3 rounded-full bg-ig-blue" /></span>.ig-progress-fill</span>
          <span className="ig-flash px-1">.ig-flash: a value changed</span>
          <span className="ig-skeleton h-4 w-32" aria-hidden />
        </div>
      </Block>
    </PageContainer>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <Heading level="h2" className="txt-xlarge-plus">{title}</Heading>
      {children}
    </section>
  )
}

function State({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="ig-card flex flex-col gap-2 p-4">
      <span className="txt-compact-xsmall text-ui-fg-muted">{label}</span>
      {children}
    </div>
  )
}
