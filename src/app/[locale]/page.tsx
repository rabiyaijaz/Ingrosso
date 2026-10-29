import Link from "next/link"
import { clx } from "@medusajs/ui"
import { DeviceFinder } from "@/components/catalog/DeviceFinder"
import { Logo } from "@/components/brand/Logo"
import { GradeTabs } from "@/components/marketing/GradeTabs"
import { HeroStage } from "@/components/marketing/HeroStage"
import { FitFragment, GradeFragment, PriceFragment, ShipFragment } from "@/components/marketing/QuestionFragments"
import { PillLink, body, display, sectionTitle, small, statement } from "@/components/marketing/Primitives"
import { ArrowRight } from "@medusajs/icons"
import { BrandMark } from "@/components/brand/BrandMark"
import { BRANDS, CATEGORIES, PRODUCTS, partCount } from "@/lib/catalog"
import { ALL_BRANDS_IMAGE, CATEGORY_IMAGE } from "@/lib/visuals"
import { Ambient } from "@/components/marketing/Ambient"
import { LogoStage } from "@/components/marketing/LogoStage"
import { GlassActionTile, GlassTile } from "@/components/marketing/GlassTile"
import { deviceTree } from "@/lib/public"
import { routes } from "@/lib/routes"

export const metadata = { title: "Ingrosso — Trade repair parts in every grade" }

const zigzag = (teeth: number, depth = 10, edges: "bottom" | "both" = "bottom") => {
  const pts: string[] = []
  const step = 100 / teeth
  if (edges === "both") {
    for (let i = 0; i <= teeth; i++) pts.push(`${(i * step).toFixed(3)}% ${i % 2 ? depth : 0}px`)
  } else pts.push("0 0", "100% 0")
  for (let i = teeth; i >= 0; i--) pts.push(`${(i * step).toFixed(3)}% calc(100% - ${i % 2 ? depth : 0}px)`)
  return `polygon(${pts.join(", ")})`
}

const QUESTIONS = [
  {
    title: "Does it fit this exact model?",
    text: "Every part is mapped to the models it fits. Type the model code from the back of the handset and you see only what fits it.",
  },
  {
    title: "Which grade suits the repair?",
    text: "Each part carries its real grade, shown beside the other grades of the same part, so the quote to your customer is honest.",
  },
  {
    title: "What do I pay for it?",
    text: "Your own trade price, with breaks at 5, 10 and 25 units, appears on every page once your account is approved.",
  },
  {
    title: "Will it ship today?",
    text: "Live stock sits on every line. Orders placed before the afternoon cut-off leave the warehouse the same working day.",
  },
]

const FRAGMENTS = [<FitFragment key="fit" />, <GradeFragment key="grade" />, <PriceFragment key="price" />, <ShipFragment key="ship" />]

// Landing imagery is two photographs only: the office plinth for the hero and
// the floating tiles for the questions beside it. Every other section uses
// the simple logo (LogoStage). Part and device renders appear in tiles only.
// The wide tiles picture pans across its width, one stop per question.
const TILES = "/brand/scene-office-wide.webp"
const TILES_ALT = "Glass Ingrosso tiles floating through a bright office"
const STAGE = [
  { src: "/brand/scene-office.webp", alt: "The Ingrosso mark on a glass plinth in a bright office" },
  { src: TILES, alt: TILES_ALT, position: "8% center" },
  { src: TILES, alt: TILES_ALT, position: "45% center" },
  { src: TILES, alt: TILES_ALT, position: "70% center" },
  { src: TILES, alt: TILES_ALT, position: "96% center" },
]

// Part tiles: one per category, each linking to its category.
const PART_TILES = CATEGORIES.map((c) => ({ cat: c.slug, label: c.plural, src: CATEGORY_IMAGE[c.slug] }))

const SLIP = [
  { when: "Today", rows: [["Create your sign-in", "1 min"], ["Company and tax number", "3 min"], ["Delivery address", "1 min"]] },
  { when: "Review", rows: [["Checked by our trade desk", "by a person"], ["You can sign in and see status", "any time"]] },
  { when: "Approved", rows: [["A price list is assigned", "per account"], ["Prices and live stock appear", "every page"]] },
]

const MENU = [
  {
    group: "Buying",
    items: [
      ["Quantity breaks", "from 5 units", "The price drops at each break, and the ladder shown is the price charged."],
      ["Four-decimal prices", "to 1/100 cent", "Small parts such as screws are priced to the fraction of a cent."],
      ["Hide prices on screen", "one switch", "Show the catalogue to a walk-in customer without your buying price."],
    ],
  },
  {
    group: "Paperwork",
    items: [
      ["VAT applied for you", "by country", "Domestic rate, EU reverse charge or zero-rated export, from your tax number."],
      ["Invoices", "in your account", "Every order's invoice to view and print, whenever you need it."],
    ],
  },
  {
    group: "Language",
    items: [["Catalogue and interface", "EN · NL · AR", "German follows. Device names stay in their global form."]],
  },
]

export default async function HomePage() {
  const tree = deviceTree()
  const example = "/en/p/iphone-17-pro-max-screen-service-pack"

  return (
    <main className="bg-ig-paper text-ig-ink">
      {/* Split stage: reading column left, fixed crystal right */}
      <section className="mx-auto grid max-w-page gap-3 p-3 lg:grid-cols-2">
        <div className="order-2 flex flex-col rounded-panel bg-ig-surface px-[clamp(20px,4vw,72px)] lg:order-1">
          <div className="flex min-h-[calc(100svh-176px)] flex-col justify-center gap-8 py-14" data-stage="0">
            <h1 className={clx(display, "max-w-[12ch]")}>The right part, in every grade</h1>
            <p className={clx(body, "max-w-[46ch] text-ig-ink-soft")}>
              Ingrosso supplies screens, batteries, ports and cameras to repair shops. Find the part for the handset on your
              bench, compare every grade, and order at your own trade price.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <PillLink href={routes.apply()}>Apply for a trade account</PillLink>
              <Link href={routes.signIn()} className={clx(small, "font-medium text-ig-ink underline-offset-4 hover:underline")}>
                Already approved? Sign in
              </Link>
            </div>
            <div data-ui className="flex flex-col gap-3 rounded-[16px] bg-ig-paper p-4 sm:p-5">
              <p className={clx(small, "font-medium")}>Find parts for a handset</p>
              <DeviceFinder tree={tree} variant="select" buttonVariant="secondary" />
            </div>
          </div>

          {QUESTIONS.map((q, i) => (
            <div key={q.title} data-stage={i + 1} data-reveal className="flex min-h-[60svh] flex-col justify-center gap-5 py-12">
              <h2 className="max-w-[18ch] text-[clamp(30px,2.6vw,42px)] leading-[1.05] tracking-[-0.03em] font-medium">{q.title}</h2>
              <p className={clx(body, "max-w-[44ch] text-ig-ink-soft")}>{q.text}</p>
              <div className="max-w-[460px]">{FRAGMENTS[i]}</div>
            </div>
          ))}
        </div>

        <div className="order-1 h-[34svh] lg:sticky lg:top-3 lg:order-2 lg:h-[calc(100svh-24px)]">
          <HeroStage
            images={STAGE}
            caption={
              <>
                <span>Same-day dispatch before the cut-off</span>
                <span className="text-ig-ink-soft">Prices for approved trade accounts</span>
              </>
            }
          />
        </div>
      </section>

      {/* Grades: square plate, spare text */}
      <section className="relative isolate overflow-hidden">
      <Ambient variant="soft" />
      <div className="relative z-[1] mx-auto grid max-w-page items-center gap-10 px-[var(--ig-gutter)] py-[clamp(88px,9vw,160px)] lg:grid-cols-2">
        <LogoStage className="mx-auto aspect-square w-full max-w-[640px]" />
        {/* Heading and claim first, then the grades to explore, then the actions */}
        <div className="flex flex-col gap-9" data-reveal>
          <div className="flex flex-col gap-5">
            <h2 className={sectionTitle}>Ten grades, named plainly</h2>
            <p className={clx(body, "max-w-[44ch] text-ig-ink-soft")}>
              Most suppliers sell “original” and “copy”. We list the real grade of every part, so a genuine screen and a
              compatible one sit side by side and you can tell your customer exactly what each is.
            </p>
          </div>
          <GradeTabs />
          <div className="flex flex-wrap gap-3">
            <PillLink href={example} iconRight={<ArrowRight />}>Compare grades on a part</PillLink>
            <PillLink href={routes.grades()} tone="paper">Read the grade guide</PillLink>
          </div>
        </div>
      </div>
      </section>

      {/* How approval works: an itinerary slip on glassy blue */}
      <section className="ig-surface-blue overflow-hidden">
        <Ambient variant="blue" />
        <div className="relative z-[1] mx-auto grid max-w-page gap-12 px-[var(--ig-gutter)] py-[clamp(88px,9vw,160px)] lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-5" data-reveal>
            <h2 className={sectionTitle}>From application to price list</h2>
            <p className={clx(body, "max-w-[34ch] text-ig-on-slate-soft")}>
              Prices are for trade only, so every account is approved by hand. Applying takes about five minutes, and you can
              browse the whole catalogue while you wait.
            </p>
            <PillLink href={routes.apply()} tone="paper" className="self-start">Start the application</PillLink>
          </div>
          <div className="lg:col-span-6 lg:col-start-7" data-reveal>
            <div className="mx-auto w-full max-w-[480px] bg-ig-paper pb-6 text-ig-ink" style={{ clipPath: zigzag(28, 10) }}>
              <div className="flex flex-col px-7 pt-7">
                {SLIP.map((g) => (
                  <div key={g.when} className="pt-7 first:pt-0">
                    <p className="text-[16px] font-semibold">{g.when}</p>
                    <ul className="mt-2 flex flex-col">
                      {g.rows.map(([what, value]) => (
                        <li key={what} className="flex items-baseline gap-2 py-1.5 text-[16px]">
                          <span>{what}</span>
                          <span aria-hidden className="mb-1 flex-1 border-b-[4px] border-dotted border-ig-paper-2" />
                          <span className="tabular-nums text-ig-ink-soft">{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex min-h-11 flex-wrap items-center justify-between gap-x-4 bg-ig-blue px-7 py-2.5 text-[16px] text-ig-on-accent">
                <span>Your trade prices, live</span>
                <span className="tabular-nums">about 5 min to apply</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Handsets: two-ended rows */}
      <section className="relative isolate overflow-hidden">
      <Ambient variant="bright" />
      <div className="relative z-[1] mx-auto grid max-w-page gap-12 px-[var(--ig-gutter)] py-[clamp(88px,9vw,160px)] lg:grid-cols-12">
        <div className="lg:col-span-5" data-reveal>
          <h2 className={clx(statement, "font-medium")}>Parts for every handset</h2>
          <div className="mt-8 flex flex-col gap-10">
            {BRANDS.map((b) => (
              <div key={b.slug}>
                <Link href={routes.brand(b.slug)} className="group inline-flex items-center gap-3">
                  <BrandMark brand={b.slug} size="md" />
                  <span className={clx(small, "font-medium text-ig-ink group-hover:text-ig-blue")}>{b.name}</span>
                </Link>
                <ul className="mt-2 pl-[48px]">
                  {b.series.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={routes.series(b.slug, s.slug)}
                        className="group flex min-h-11 items-center gap-2.5 py-1 transition-transform hover:translate-x-1"
                      >
                        <BrandMark brand={b.slug} size="xs" />
                        <span className="text-[16px] group-hover:text-ig-blue">{s.name}</span>
                        <span className="ml-auto text-[15px] tabular-nums text-ig-ink-soft">
                          {s.models.length} models · {partCount(s)} parts
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center gap-6 lg:col-span-6 lg:col-start-7" data-reveal>
          <ul className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2">
            {PART_TILES.map((t) => (
              <li key={t.cat}>
                <GlassTile
                  href={routes.category(t.cat)}
                  src={t.src}
                  label={t.label}
                  detail={`${PRODUCTS.filter((p) => p.category === t.cat).length} parts`}
                />
              </li>
            ))}
            <li>
              <GlassActionTile href={routes.devices()} title="Start from the handset" action="Shop by device" src={ALL_BRANDS_IMAGE} />
            </li>
          </ul>
        </div>
      </div>
      </section>

      {/* Capabilities as a printed menu */}
      <section className="relative isolate overflow-hidden py-[clamp(88px,9vw,160px)]">
        <Ambient variant="deep" />
        <div className="relative z-[1] mx-auto grid max-w-page gap-12 px-[var(--ig-gutter)] lg:grid-cols-12">
          <div className="lg:col-span-4 lg:col-start-2" data-reveal>
            <h2 className={sectionTitle}>Built for the counter</h2>
            <p className={clx(body, "mt-6 max-w-[34ch] text-ig-ink-soft")}>
              The details a repair shop checks before it trusts a supplier, all in one account.
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7" data-reveal>
            <div className="mx-auto w-full max-w-[600px] bg-ig-paper px-6 py-12 sm:px-10" style={{ clipPath: zigzag(36, 9, "both") }}>
              {MENU.map((g) => (
                <div key={g.group} className="mt-11 first:mt-0">
                  <p className="text-[18px] font-semibold">{g.group}</p>
                  <ul className="mt-3 flex flex-col gap-[18px]">
                    {g.items.map(([name, value, note]) => (
                      <li key={name}>
                        <div className="flex items-baseline gap-2 text-[18px]">
                          <span>{name}</span>
                          <span aria-hidden className="mb-1 flex-1 border-b-[4px] border-dotted border-ig-paper-2" />
                          <span className="whitespace-nowrap tabular-nums">{value}</span>
                        </div>
                        <p className={clx(small, "max-w-[34ch] text-ig-ink-soft")}>{note}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing photograph, text beside */}
      <section className="overflow-hidden">
        <LogoStage tone="dark" className="h-[44svh] lg:h-[60svh]" />
        <div className="ig-surface-blue overflow-hidden">
        <Ambient variant="blue" />
        <div className="relative z-[1] mx-auto grid max-w-page gap-8 px-[var(--ig-gutter)] py-16 lg:grid-cols-12 lg:py-24" data-reveal>
          <h2 className={clx(sectionTitle, "font-light lg:col-span-6")}>Apply once, buy at your price</h2>
          <div className="flex flex-col gap-6 lg:col-span-5 lg:col-start-8">
            <p className={clx(body, "text-ig-on-slate-soft")}>
              One application, checked by a person. After that, every part shows your price and live stock.
            </p>
            <PillLink href={routes.apply()} tone="paper" className="self-start">Apply for a trade account</PillLink>
          </div>
        </div>
        </div>
      </section>

      {/* Footer: photograph half, menu half */}
      <footer className="grid bg-ig-paper lg:min-h-[100svh] lg:grid-cols-2">
        <LogoStage tone="dark" className="h-[50svh] lg:h-auto" />
        <div className="flex flex-col justify-between gap-16 px-[var(--ig-gutter)] py-14 lg:px-[6vw] lg:pt-20">
          <div className="flex flex-col gap-10">
            <Logo size="sm" href={routes.home()} />
            <nav aria-label="Footer">
              <ul className="ig-menu">
                {[
                  ["Shop by device", routes.devices()],
                  ["Screens", routes.category("screens")],
                  ["Batteries", routes.category("batteries")],
                  ["How we grade parts", routes.grades()],
                  ["Apply for trade", routes.apply()],
                  ["Sign in", routes.signIn()],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="ig-menu__row">
                      <span className="ig-menu__label">{label}</span>
                      <span aria-hidden className="ig-icon-frame ig-glass-icon ig-menu__arrow" data-size="lg">
                        <ArrowRight />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="flex flex-col gap-10">
            <div className={clx(small, "grid gap-8 sm:grid-cols-2")}>
              <div>
                <p className="font-medium">Dispatch</p>
                <p className="mt-1 text-ig-ink-soft">Orders before the afternoon cut-off ship the same working day.</p>
              </div>
              <div>
                <p className="font-medium">Languages</p>
                <p className="mt-1 text-ig-ink-soft">English, Nederlands and العربية. Deutsch follows.</p>
              </div>
            </div>
            <p className="text-[13px] text-ig-ink-soft">
              © 2026 Ingrosso. Trade sales only. Apple, Samsung, Google and Xiaomi names and logos belong to their owners and
              show compatibility only.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
