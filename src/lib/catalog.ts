// Sample catalogue. Every name, code, price and stock figure here is
// placeholder data for design review and must be replaced by the client's
// import before launch. The public half (this file's exported shapes minus
// `commercial`) carries no price or quantity, mirroring BRD R1.

export type GradeId =
  | "service_pack"
  | "service_pack_preassembled"
  | "original"
  | "pulled"
  | "oem"
  | "soft_oled"
  | "hard_oled"
  | "refurbished"
  | "in_cell"
  | "compatible"

export type Grade = {
  id: GradeId
  rank: number // 1 = genuine end of the ladder, 10 = third-party end
  label: string
  family: "Genuine" | "Aftermarket" | "Third-party"
  summary: string
}

export const GRADES: Grade[] = [
  { id: "service_pack", rank: 1, label: "Service pack", family: "Genuine", summary: "Genuine part from the manufacturer's authorised service channel, in service packaging." },
  { id: "service_pack_preassembled", rank: 2, label: "Service pack, pre-assembled", family: "Genuine", summary: "Genuine service pack with frame and adhesive already fitted." },
  { id: "original", rank: 3, label: "Original", family: "Genuine", summary: "Genuine manufacturer part sourced outside the service channel." },
  { id: "pulled", rank: 4, label: "Pulled original", family: "Genuine", summary: "Genuine part taken from a new or nearly new device and tested." },
  { id: "oem", rank: 5, label: "OEM", family: "Aftermarket", summary: "Made by the manufacturer's own supplier to the original specification." },
  { id: "soft_oled", rank: 6, label: "Soft OLED", family: "Aftermarket", summary: "Flexible aftermarket OLED. The closest aftermarket match to original." },
  { id: "hard_oled", rank: 7, label: "Hard OLED", family: "Aftermarket", summary: "Rigid aftermarket OLED. True blacks, slightly thicker glass." },
  { id: "refurbished", rank: 8, label: "Refurbished", family: "Aftermarket", summary: "Genuine part with replaced glass or components, retested." },
  { id: "in_cell", rank: 9, label: "In-cell", family: "Third-party", summary: "Aftermarket LCD with touch built into the panel. Lowest-cost display." },
  { id: "compatible", rank: 10, label: "Compatible", family: "Third-party", summary: "Third-party part made to fit and function." },
]

export const gradeById = (id: GradeId) => GRADES.find((g) => g.id === id)!

export type Model = { slug: string; name: string; codes: string[] }
export type Series = { slug: string; name: string; models: Model[] }
export type Brand = { slug: string; name: string; series: Series[] }

export const BRANDS: Brand[] = [
  {
    slug: "apple",
    name: "Apple",
    series: [
      { slug: "iphone-17", name: "iPhone 17", models: [
        { slug: "iphone-17-pro-max", name: "iPhone 17 Pro Max", codes: ["A3526", "A3527"] },
        { slug: "iphone-17-pro", name: "iPhone 17 Pro", codes: ["A3522", "A3523"] },
        { slug: "iphone-air", name: "iPhone Air", codes: ["A3517"] },
        { slug: "iphone-17", name: "iPhone 17", codes: ["A3519", "A3520"] },
      ] },
      { slug: "iphone-16", name: "iPhone 16", models: [
        { slug: "iphone-16-pro-max", name: "iPhone 16 Pro Max", codes: ["A3084", "A3295"] },
        { slug: "iphone-16-pro", name: "iPhone 16 Pro", codes: ["A3083", "A3292"] },
        { slug: "iphone-16-plus", name: "iPhone 16 Plus", codes: ["A3082"] },
        { slug: "iphone-16", name: "iPhone 16", codes: ["A3081", "A3286"] },
      ] },
      { slug: "iphone-15", name: "iPhone 15", models: [
        { slug: "iphone-15-pro-max", name: "iPhone 15 Pro Max", codes: ["A2849", "A3106"] },
        { slug: "iphone-15-pro", name: "iPhone 15 Pro", codes: ["A2848", "A3102"] },
        { slug: "iphone-15", name: "iPhone 15", codes: ["A2846", "A3090"] },
      ] },
      { slug: "ipad-pro", name: "iPad Pro", models: [
        { slug: "ipad-pro-13-m4", name: "iPad Pro 13-inch (M4)", codes: ["A2925", "A2926"] },
        { slug: "ipad-pro-11-m4", name: "iPad Pro 11-inch (M4)", codes: ["A2836", "A2837"] },
      ] },
    ],
  },
  {
    slug: "samsung",
    name: "Samsung",
    series: [
      { slug: "galaxy-s25", name: "Galaxy S25", models: [
        { slug: "galaxy-s25-ultra", name: "Galaxy S25 Ultra", codes: ["SM-S938B"] },
        { slug: "galaxy-s25-plus", name: "Galaxy S25+", codes: ["SM-S936B"] },
        { slug: "galaxy-s25", name: "Galaxy S25", codes: ["SM-S931B"] },
      ] },
      { slug: "galaxy-a", name: "Galaxy A", models: [
        { slug: "galaxy-a56", name: "Galaxy A56 5G", codes: ["SM-A566B"] },
        { slug: "galaxy-a36", name: "Galaxy A36 5G", codes: ["SM-A366B"] },
        { slug: "galaxy-a16", name: "Galaxy A16", codes: ["SM-A165F"] },
      ] },
      { slug: "galaxy-z", name: "Galaxy Z", models: [
        { slug: "galaxy-z-fold7", name: "Galaxy Z Fold7", codes: ["SM-F966B"] },
        { slug: "galaxy-z-flip7", name: "Galaxy Z Flip7", codes: ["SM-F766B"] },
      ] },
    ],
  },
  {
    slug: "google",
    name: "Google",
    series: [
      { slug: "pixel-9", name: "Pixel 9", models: [
        { slug: "pixel-9-pro-xl", name: "Pixel 9 Pro XL", codes: ["GGX8B"] },
        { slug: "pixel-9-pro", name: "Pixel 9 Pro", codes: ["GEC77"] },
        { slug: "pixel-9", name: "Pixel 9", codes: ["G2YBB"] },
      ] },
    ],
  },
  {
    slug: "xiaomi",
    name: "Xiaomi",
    series: [
      { slug: "redmi-note-14", name: "Redmi Note 14", models: [
        { slug: "redmi-note-14-pro-plus", name: "Redmi Note 14 Pro+", codes: ["24115RA8EG"] },
        { slug: "redmi-note-14-pro", name: "Redmi Note 14 Pro", codes: ["24116RACCG"] },
      ] },
    ],
  },
]

export type Category = { slug: string; name: string; plural: string }

export const CATEGORIES: Category[] = [
  { slug: "screens", name: "Screen assembly", plural: "Screens" },
  { slug: "batteries", name: "Battery", plural: "Batteries" },
  { slug: "charging-ports", name: "Charging port flex", plural: "Charging ports" },
  { slug: "cameras", name: "Rear camera", plural: "Cameras" },
  { slug: "back-glass", name: "Back glass", plural: "Back glass" },
  { slug: "small-parts", name: "Screw set", plural: "Small parts" },
  { slug: "tools", name: "Tool", plural: "Tools" },
]

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug)

export type ModelRef = { brand: Brand; series: Series; model: Model }

export function findModel(modelSlug: string): ModelRef | undefined {
  for (const brand of BRANDS)
    for (const series of brand.series)
      for (const model of series.models)
        if (model.slug === modelSlug) return { brand, series, model }
}

export const allModels = (): ModelRef[] =>
  BRANDS.flatMap((brand) =>
    brand.series.flatMap((series) => series.models.map((model) => ({ brand, series, model })))
  )

// Money is integer ten-thousandths of a euro (4 decimals, BRD PRC-06 / R3).
export type Money = number
export type PriceBreak = { minQty: number; unit: Money }

export type Product = {
  slug: string
  sku: string
  name: string
  category: string
  grade: GradeId | null
  models: string[] // model slugs this part fits (CAT-07)
  specs: [string, string][]
  orderStep: number // sold in multiples of this
  // Commercial half: only lib/commerce.ts may read this (BRD R2).
  commercial: {
    lists: Record<string, PriceBreak[]>
    onHand: number
    reserved: number
  }
}

// Deterministic pseudo-random so sample stock is stable between renders.
function seed(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619)
  return (h >>> 0) % 1000
}

// Integer-only percentage: never multiplies money by a fraction (R3).
const less = (amount: Money, pct: number) => {
  const scaled = amount * (100 - pct)
  return (scaled - (scaled % 100)) / 100
}

const ladder = (unit: Money, steps: [number, number][]): PriceBreak[] =>
  steps.map(([minQty, pct]) => ({ minQty, unit: less(unit, pct) }))

const STANDARD_STEPS: [number, number][] = [[1, 0], [5, 3], [10, 6], [25, 10]]

// Two sample price lists: a standard trade list and a volume list.
const lists = (unit: Money, steps = STANDARD_STEPS) => ({
  "trade-standard": ladder(unit, steps),
  "trade-volume": ladder(less(unit, 6), steps),
})

const eur = (whole: number, tenThousandths = 0): Money => whole * 10000 + tenThousandths

const SCREEN_GRADES: Record<string, { grade: GradeId; base: number }[]> = {
  apple: [
    { grade: "service_pack", base: 219 },
    { grade: "pulled", base: 164 },
    { grade: "soft_oled", base: 96 },
    { grade: "hard_oled", base: 71 },
    { grade: "in_cell", base: 42 },
  ],
  samsung: [
    { grade: "service_pack_preassembled", base: 205 },
    { grade: "service_pack", base: 178 },
    { grade: "oem", base: 118 },
    { grade: "in_cell", base: 39 },
  ],
  default: [
    { grade: "original", base: 129 },
    { grade: "oem", base: 88 },
    { grade: "compatible", base: 36 },
  ],
}

const tierFactor = (modelName: string) =>
  /Ultra|Pro Max|Fold|13-inch|Pro XL/.test(modelName) ? 115 : /Pro|\+|Plus|Air/.test(modelName) ? 100 : 84

const scale = (base: number, factor: number) => {
  const v = base * factor
  return (v - (v % 100)) / 100
}

function stockFor(key: string) {
  const s = seed(key)
  const onHand = s % 9 === 0 ? 0 : 6 + (s % 240)
  const reserved = onHand === 0 ? 0 : s % 5
  return { onHand, reserved }
}

function buildProducts(): Product[] {
  const out: Product[] = []
  for (const { brand, model } of allModels()) {
    const factor = tierFactor(model.name)
    const grades = SCREEN_GRADES[brand.slug] ?? SCREEN_GRADES.default
    const isTablet = model.slug.startsWith("ipad")
    for (const { grade, base } of grades) {
      const g = gradeById(grade)
      const slug = `${model.slug}-screen-${grade.replace(/_/g, "-")}`
      out.push({
        slug,
        sku: `SCR-${model.codes[0]}-${String(g.rank).padStart(2, "0")}`,
        name: `${model.name} ${isTablet ? "display" : "screen"} assembly, ${g.label}`,
        category: "screens",
        grade,
        models: [model.slug],
        specs: [
          ["Panel", /oled|service|pulled|original|oem|refurb/.test(grade) ? "OLED" : "LCD (in-cell)"],
          ["Touch", "Integrated"],
          ["Frame", grade === "service_pack_preassembled" ? "Fitted" : "Not included"],
          ["True Tone transfer", brand.slug === "apple" ? "Supported with programmer" : "Not applicable"],
        ],
        orderStep: 1,
        commercial: { lists: lists(eur(scale(base, factor))), ...stockFor(slug) },
      })
    }
    for (const [grade, base] of [["oem", 34], ["compatible", 17]] as const) {
      const slug = `${model.slug}-battery-${grade}`
      out.push({
        slug,
        sku: `BAT-${model.codes[0]}-${grade === "oem" ? "05" : "10"}`,
        name: `${model.name} battery, ${gradeById(grade).label}`,
        category: "batteries",
        grade,
        models: [model.slug],
        specs: [["Chemistry", "Li-ion polymer"], ["Adhesive strips", "Included"], ["Health message", "May show on unknown part"]],
        orderStep: 1,
        commercial: { lists: lists(eur(scale(base, factor), 5000)), ...stockFor(slug) },
      })
    }
    if (!isTablet) {
      const slug = `${model.slug}-charging-port-original`
      out.push({
        slug,
        sku: `CHG-${model.codes[0]}-03`,
        name: `${model.name} charging port flex, original`,
        category: "charging-ports",
        grade: "original",
        models: [model.slug],
        specs: [["Connector", "USB-C"], ["Includes", "Microphone and antenna contacts"]],
        orderStep: 1,
        commercial: { lists: lists(eur(scale(27, factor), 9000)), ...stockFor(slug) },
      })
      const cam = `${model.slug}-rear-camera-pulled`
      out.push({
        slug: cam,
        sku: `CAM-${model.codes[0]}-04`,
        name: `${model.name} rear camera module, pulled original`,
        category: "cameras",
        grade: "pulled",
        models: [model.slug],
        specs: [["Lenses", "Main, ultra wide, telephoto where fitted"], ["Tested", "Focus, OIS, flash sync"]],
        orderStep: 1,
        commercial: { lists: lists(eur(scale(74, factor))), ...stockFor(cam) },
      })
    }
  }

  // A part that fits a whole family (CAT-10) and a four-decimal price (PRC-06).
  out.push({
    slug: "iphone-17-series-bottom-pentalobe-screws",
    sku: "SCW-A35-P2",
    name: "Bottom pentalobe screws, iPhone 17 series",
    category: "small-parts",
    grade: "original",
    models: ["iphone-17-pro-max", "iphone-17-pro", "iphone-17", "iphone-air"],
    specs: [["Head", "Pentalobe P2"], ["Finish", "Colour matched"], ["Sold per", "Single screw, in multiples of 50"]],
    orderStep: 50,
    commercial: {
      lists: lists(eur(0, 450), [[50, 0], [500, 8], [2000, 15]]),
      onHand: 18400,
      reserved: 1200,
    },
  })

  const tools: [string, string, number, [string, string][]][] = [
    ["Precision screwdriver set, 24 bits", "TL-SD24", 18, [["Bits", "24, magnetic S2 steel"], ["Includes", "Pentalobe, Tri-wing, Phillips, Torx"]]],
    ["Heated separator plate, 230 V", "TL-HSP230", 89, [["Surface", "200 × 140 mm"], ["Range", "60 to 120 °C"]]],
    ["Display programmer for True Tone and battery data", "TL-PRG1", 149, [["Supports", "iPhone 11 to iPhone 17 series"], ["Updates", "Over Wi-Fi"]]],
    ["Opening picks, pack of 100", "TL-PK100", 6, [["Material", "0.3 mm guitar-pick plastic"]]],
  ]
  for (const [name, sku, base, specs] of tools) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "")
    out.push({
      slug,
      sku,
      name,
      category: "tools",
      grade: null,
      models: [],
      specs,
      orderStep: 1,
      commercial: { lists: lists(eur(base)), ...stockFor(slug) },
    })
  }
  return out
}

export const PRODUCTS: Product[] = buildProducts()

export const productBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug)

export const productsForModel = (modelSlug: string) =>
  PRODUCTS.filter((p) => p.models.includes(modelSlug))

export const partCount = (series: Series) =>
  PRODUCTS.filter((p) => p.models.some((m) => series.models.some((sm) => sm.slug === m))).length
