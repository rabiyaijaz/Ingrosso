# Ingrosso design system

Medusa UI is the base. Ingrosso's look lives in one stylesheet, and every screen is built from the shared components below, so a design change is made once and lands everywhere.

Live catalogue of every component and state: `/en/system`.

## Design lab

Design changes are made and reviewed in the lab first, then confirmed into the main app.

| | Main app | Design lab |
| --- | --- | --- |
| Folder | `E:\Miqdad\wholesale-platform` | `E:\Miqdad\wholesale-platform-lab` (git worktree) |
| Branch | `main` (deploys to ingrosso.vercel.app) | `lab` (local) |
| Local URL | http://localhost:3310 | http://localhost:3311 |
| Forms | Validated | Skip validation, so every flow can be clicked through |
| Toolbar | None | Preview as, next step, jump to any flow, reset |

The lab is switched on by `NEXT_PUBLIC_LAB=1` in the lab folder's `.env.local`, which git ignores, so it can never reach `main` or Vercel. The lab also uses its own cookie names, so its sign-in and order don't mix with the main app's.

**On confirm:** merge `lab` into `main`, push `main` to GitHub, and Vercel deploys it.

## Where things live

| What | File |
| --- | --- |
| All colours, radii, the grade ramp, and the Medusa variable overrides | `src/app/globals.css` |
| Fonts and Tailwind token names (`ig-*`) | `tailwind.config.ts` |
| Brand mark and wordmark | `src/components/brand/Logo.tsx` |

To reskin for another wholesaler, change the `:root:root` block in `globals.css` and the brand images in `public/brand/`.

## Look and feel

Light, glassy and minimal, in the Apple style: very light blue gradients, frosted surfaces with a white top highlight, soft blue shadows, and gentle motion. Never flat grey, never black buttons.

- **Page:** a very light cool gradient behind every page; the header is frosted glass.
- **Cards:** soft white glass (`.shadow-elevation-card-rest` in the light theme).
- **Feature bands:** glassy bright blue (`.ig-surface-blue`): blue gradient, soft white light, fine glass grain, white text. Used for the approval section, closing text, footer, top strip and apply panel. No grey or slate bands.
- **Light sections:** `Ambient` gives a soft gradient with drifting light and scroll parallax.
- **Part tiles:** `GlassTile` on a deep black-to-blue, mostly blue, background with a breathing glow, cursor tilt and light sweep; label on a frosted strip below the picture.
- **Brand pictures:** `MotionScene` (focus-in, breathing, glow pulse, light sweep, rising sparkles, scroll and cursor parallax).
- **Top strip:** a small delivery truck drives along a moving road beside the dispatch countdown; trade promises slide in one after another on the right (`CutoffCountdown withTruck`, `StripTicker`).
- **Big menus** (landing footer): full-width rows with hairlines, a glass arrow tile that turns solid blue on hover, and a soft blue wash (`.ig-menu`).
- All motion stops under `prefers-reduced-motion`.

## Buttons

One component: `components/ui/Button`. Nothing else is styled as a button.

| | |
| --- | --- |
| Variants | `primary` (blue) and `secondary` (white) for every action; `ghost` for icon-only and toolbar buttons; `danger` for destructive actions. No black buttons. |
| Sizes | `sm` 32 · `md` 40 · `lg` 48 · `xl` 56 px tall |
| Shape | Always a full pill |
| Icons | `iconLeft`, `iconRight`, both, or `iconOnly` |
| States | Hover lift and sheen, press squish, `isLoading` spinner, disabled |
| Burst | Glassy ring and beads on press; on by default for `primary` at `lg`/`xl` (main calls to action) |
| Links | `asChild` with a Next `<Link>`; on marketing pages use `PillLink` (`accent` = blue, `paper` = white) |

## Icon frames

Every icon that sits in a frame (grade icons, brand logos, feature icons) uses `.ig-icon-frame`:

- **Shape:** always a rounded square, never a circle. Corner radius is 28% of the frame.
- **Glyph:** 56% of the frame at every size, centred on both axes.
- **Sizes (frame / glyph px):** `xs` 20/11 · `sm` 28/16 · `md` 36/20 · `lg` 48/27 · `xl` 56/31.
- **Wide marks** (a wordmark such as Samsung's) use `data-wide`: twice as wide, same height and radius.
- **Finish:** `.ig-glass-icon` with `data-family`: `Genuine` solid blue glass, `Aftermarket` clear glass with a blue glyph, `Third-party` clear glass with a grey glyph, `Brand` clear glass with an ink logo that turns the brand colour on hover.

Where each size is used: `xs` in grade badges and brand rows; `sm` in the device finder; `md` in the grade list and page headings; `lg` in feature fragments, the device tile and model tiles.

**Frame or no frame:**

- **Rounded-square containers** (tags, badges, list rows, tiles): the icon goes in a frame.
- **Pill buttons and chips** (buttons, filter chips, anything fully rounded): the icon goes in bare, with no frame (`GradeIcon bare` / `.ig-icon-bare`, `BrandMark variant="plain"`, or a plain icon in `Button`). A bare grade icon is tinted by family and takes the chip's text colour when the chip is selected.

## Part listings (layouts under review)

Category, device-model and search pages share `catalog/ListingView`. The lab's **Layout** switch (or `?listing=`) previews:

| Layout | Pattern |
| --- | --- |
| `current` | Grade chips on top, small side facets (the layout before review) |
| `sidebar` | A · Sticky filter panel of collapsible checkbox groups, applied-filter chips, count + sort, dense table |
| `topbar` | B · Dropdown filter buttons with chevrons, applied-filter chips, count + sort, product cards |
| `tabs` | C · Large grade-family tabs, side panel for grade/brand/availability, table |

Filter order in every layout: Availability (one "In stock only" switch), Brand, Grade, Part. Ticking a brand opens its models underneath, grouped by series (`BrandChecks`, `?model=`); unticking the brand clears its models.

Prices in lists: the unit price, then the best quantity-break price as a blue tag (stacked-boxes icon, `25+ · €197.10`). Stock and price never wrap. The sticky filter panel scrolls on its own with no visible scrollbar (`.ig-scroll-quiet`).

Filter rules in every layout: real checkboxes with counts, a chevron on anything that opens, every active filter shown as a removable chip with Clear all, filters kept in the URL, no price sort (CAT-12), and "In stock only" shown to approved accounts only. On phones the filter panel folds behind one Filters button. The main app keeps `DEFAULT_LISTING` in `lib/listing-variants.ts` until a layout is chosen.

## Brand logos

`brand/BrandMark` draws the Apple, Samsung, Google and Xiaomi logos (Simple Icons) in an icon frame, or `variant="plain"` inline. They show compatibility only; both footers carry the trademark note.

## Shared components

| Component | Use it for |
| --- | --- |
| `commerce/PriceTag` | Every price, in every state: gated, masked, priced |
| `commerce/StockTag` | Every stock figure: count, hidden, out (never mixed up) |
| `commerce/Figure` | Every number, SKU or reference, with aligned monospaced digits |
| `commerce/QuantityBreaks` | The quantity price ladder |
| `commerce/QuantityStepper` | Every quantity input; respects order step |
| `commerce/AddToOrder` | Add to order, in a table row or on the product page |
| `commerce/GateCallout` | What an unapproved viewer sees instead of buy controls |
| `ui/Button` | Every button and button-styled link |
| `brand/BrandMark` | Device-brand logos |
| `catalog/Grade` | `GradeIcon`, `GradeBadge` and `GradeScale` (ten-step ladder) |
| `marketing/GlassTile` | Landing part tiles and the shop-by-device tile |
| `marketing/Ambient` | Light gradient section backgrounds with drifting light |
| `marketing/MotionScene` | Living brand pictures (hero, closing banner) |
| `catalog/DeviceFinder` | Brand → Series → Model, as columns or as selects |
| `catalog/ProductTable` | Dense part listings |
| `catalog/Facets` | Grade filter bar and URL-based facet groups |
| `catalog/ListingView` | Full listing layout (device, category, search) |
| `catalog/GradeCompare` | All grades of one part side by side |
| `catalog/PartGlyph` | Drawn part stand-ins in product tables until product photography arrives |
| `layout/*` | Header, footer, search, device menu, page frame |

## Rules carried from the BRD

- Prices and stock are read in one place only: `src/lib/commerce.ts` (R2).
- Money is integer ten-thousandths of a euro, never a float (R3).
- "Stock hidden" and "Out of stock" are always different states and never render alike (R7).
- No dead controls, invented contacts or fake trust badges (R10).

## Placeholder content to replace before launch

- The catalogue in `src/lib/catalog.ts`, including model codes, prices and stock.
- The 18:00 CET dispatch cut-off in `layout/CutoffCountdown.tsx`.
- The sample company, orders and address on the account page.
- The part drawings, which stand in for licensed product photos.
- The "Preview as" switch and the prototype sign-in, which stand in for real authentication.
