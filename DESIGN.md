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
- **Landing pictures:** two photographs only. The office plinth (`scene-office`) is fixed beside the hero and the questions and never swaps, only breathes and moves with parallax; the floating tiles (`scene-office-wide`) fill the closing band. Every other section uses the simple logo as its picture (`marketing/LogoStage`, `tone="light"` or `"dark"`).
- **Brand pictures:** `MotionScene` (focus-in, breathing, glow pulse, light sweep, rising sparkles, scroll and cursor parallax).
- **Top strip:** a small delivery truck drives along a moving road beside the dispatch countdown; trade promises slide in one after another on the right (`CutoffCountdown withTruck`, `StripTicker`).
- **Big menus** (landing footer): full-width rows with hairlines, a glass arrow tile that turns solid blue on hover, and a soft blue wash (`.ig-menu`).
- All motion stops under `prefers-reduced-motion`.

**Text contrast, every theme:** text passes WCAG AA (4.5:1, 3:1 for large text) on whatever sits behind it. Dark text on bright fills, light text on deep fills, never light on light. Each theme sets its band (`--ig-band-from/-mid/-to`), the text on it (`--ig-band-ink`, `--ig-band-ink-soft`) and the text on accent fills (`--ig-on-accent`) as a pair that passes at the fill's lightest point. A bright accent (Obsidian green, Amber copper) gets a bright band with dark text; a deep accent (light, Cobalt) gets a deep band with white text. Muted text and links are set per theme to pass on their cards and tinted rows.

## Buttons

One component: `components/ui/Button`. Nothing else is styled as a button.

**The next step is always in view.** In every flow and form, the main button for the next step (Continue, Send application, Place order, Save, Add) sits at the top: beside the step tabs, or in the page header, so it shows on the first screen without scrolling. On small screens, decision panels (such as approving an application) come first.

| | |
| --- | --- |
| Variants | `primary` (blue) and `secondary` (white) for every action; `ghost` for icon-only and toolbar buttons; `danger` for destructive actions. No black buttons. |
| Sizes | `sm` 32 · `md` 40 · `lg` 48 · `xl` 56 px tall |
| Shape | Always a full pill |
| Icons | `iconLeft`, `iconRight`, both, or `iconOnly` |
| States | Hover lift and sheen, press squish, `isLoading` spinner, disabled |
| Burst | Glassy ring and beads on press; on by default for `primary` at `lg`/`xl` (main calls to action) |
| Links | `asChild` with a Next `<Link>`; on marketing pages use `PillLink` (`accent` = blue, `paper` = white) |
| Forms that post to a server action | `ui/SubmitButton`: spinner while it runs (a double click can't run it twice), `confirm` asks first for anything hard to undo (cancel an order, suspend, decline, delete, reset), `done` says it worked with a toast. Store and trade desk alike. |
| Header toolbar | Account and Sign in are `ghost` (toolbar); the order button is `layout/CartButton`, its badge pops on every add |

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
- **Card heads** (address, delivery and payment options, review cards, the order summary): a plain icon in the accent colour, no frame (`commerce/ChoiceCard` `CardIcon`).
- **Order views** (cart, checkout summary): a small part picture beside each line; totals as plain rows, the grand total in larger type, no coloured band.

## Tabs: two kinds only

- **Segmented tabs** (`.ig-steps`, `.ig-steps__tab`): one soft pill track, the current one a white pill. Used for steps (checkout, application: equal-width, Medusa's status icon), for views (every trade desk list, through `admin/Kit` `Tabs`, sized to their labels with `data-fit`, with a count) and for switching a picker (Add product's brands). Current = `data-state="active"` (Radix) or `aria-current="page"` (links). Checkout steps are all clickable, with Back and Continue in the same row at the top; the application form opens steps as they are reached, because each is checked before moving on. A new step panel slides in (`.ig-panel-in`).
- **Icon tabs** (`.ig-icontabs`, `.ig-icontabs__tab`, `__label`, `__note`): a few big choices that each have a glass icon and a one-line note. The grade families on listings (`FamilyTabs`) and on the landing page (`GradeTabs`) use exactly this. Chosen = white card with an accent rim and glow.

The category bar (`CategoryNav`) is navigation, not tabs: solid blue pill for the page you are on.

## Building blocks

Every one of these exists once; pages use them, never a copy.

| Block | Where | Rule |
| --- | --- | --- |
| Card | `.ig-card` | Every card, panel, summary and table wrapper: 16px corners, base surface, the glass card shadow. `.ig-card-hover` for cards that are links or choices. `admin/Kit` `Panel` is a card with a title. |
| Inset | `.ig-inset` | A quiet sub-panel inside a card: facts, notes, the gate callout, the grade scale. |
| Chip | `ui/Chip`, `chipClass()` | Filter chips, model and brand picks, "fits" lists, info labels. Pill; sizes sm 32 · md 36 · lg 40; off = outline, selected = accent wash + accent text + accent rim; `static` for a label. Icons bare. |
| Search field | `ui/SearchField` | Every plain search box (trade desk lists, parts overview, 404). sm 36 · md 40, leading magnifier from `WithIcon`. The header typeahead (`layout/SearchBox`) and the listing's find-in-list are the two typeaheads. |
| Page title | `.ig-page-title` | Every h1: 32/38; `data-size="compact"` 28/34 for the trade desk and long product names. `PageHeading` and `AdminHeader` use it. |
| Breadcrumb | `layout/Page` `Breadcrumbs` | Store and trade desk; ends on the current page. |
| Section headings | | `txt-xlarge-plus` for a page section, `txt-compact-medium-plus` for a heading inside a card. |
| Empty state | `ui/EmptyState` | Nothing in a list, the order, a filtered view, a 404 or an error. Accent icon (optional), short title, one line, at most one action. `tone` card, inset or plain. |
| Loading | `ui/ListingSkeleton`, `.ig-skeleton` | Part listings show their own shape while loading (`loading.tsx` on category, model and search). |

## Motion and feedback

One shared set in `globals.css`, all off under `prefers-reduced-motion`:

| Class | Moment |
| --- | --- |
| `.ig-progress-fill` | An order's progress bar fills step by step (store order page, trade desk order) |
| `.ig-row-in` | A new history line, empty state or banner fades up |
| `.ig-panel-in` | A step panel slides in when its tab opens |
| `.ig-flash` | A value that just changed glows once (the line total as the quantity changes) |
| `ui/CheckDraw` | A tick draws itself: order placed, application sent |
| `.ig-count-pop` | A nav count that changed pops |
| Toasts | After every action: what happened, and the next step as a link where there is one ("View order", "Undo") |

## Part listings (layouts under review)

Category, device-model and search pages share `catalog/ListingView`. The lab's **Layout** switch (or `?listing=`) previews:

| Layout | Pattern |
| --- | --- |
| `current` | Grade chips on top, small side facets (the layout before review) |
| `sidebar` | A · Sticky filter panel of collapsible checkbox groups, applied-filter chips, count + sort, dense table |
| `topbar` | B · Dropdown filter buttons with chevrons, applied-filter chips, count + sort, product cards |
| `tabs` | C · Large grade-family tabs, side panel for grade/brand/availability, table |

Every listing has a **search within these parts** field (`FindInList`, `?find=`): at the top of the filter panel, and first in the top filter bar. It matches like the header search (name, SKU, model name or code), keeps every other filter, and shows as a removable chip.

Filter order in every layout: Availability (one "In stock only" switch), Brand, Grade, Part. Ticking a brand opens its models underneath, grouped by series (`BrandChecks`, `?model=`); unticking the brand clears its models.

Prices in lists: the unit price, then the best quantity-break price as a blue tag (stacked-boxes icon, `25+ · €197.10`). Stock and price never wrap. In the sticky filter panel the heading and the search stay fixed; only the filter groups below scroll, with no visible scrollbar (`.ig-scroll-quiet`).

Filter rules in every layout: real checkboxes with counts, a chevron on anything that opens, every active filter shown as a removable chip with Clear all, filters kept in the URL, no price sort (CAT-12), and "In stock only" shown to approved accounts only. On phones the filter panel folds behind one Filters button. The main app keeps `DEFAULT_LISTING` in `lib/listing-variants.ts` until a layout is chosen.

## Brand assets (3D library)

Source: `E:\Miqdad\website_assets` (renders made in Antigravity), optimised to WebP in `public/`. Pictures of parts and devices are chosen in one file, `lib/visuals.ts`.

| Use | Files |
| --- | --- |
| Logo mark | `brand/logo-mark.webp`, the frosted silver glass edition (blue crystal "I", soft warm core), everywhere: header, footers, logo stages; it reads on light, blue and dark grounds, so `Logo tone` only sets the wordmark colour. Favicon `app/icon.png`, `app/apple-icon.png` from the same mark |
| Category renders | `parts/<category>.webp`: landing tiles and the product page picture |
| Simple glass part icons | `catalog/PartIcon`: one plain glyph per category in currentColor with a tinted fill. Used at small sizes, where a 3D render is too busy to recognise: the category bar (bare, in the pill), product rows, product cards and the grade comparison (in a glass frame). The lab's **Icons** switch (or `?icons=render`) previews the 3D renders there instead; the main app uses `DEFAULT_ICON_STYLE` (`glass`) |
| Screen grade tiers | `parts/tier-1..4.webp`: tier 1 Service pack / Original, tier 2 Pulled / Refurbished, tier 3 Soft OLED, tier 4 In-cell / Compatible; other screen grades show the plain screen render |
| Device families | `ecosystem/<brand>.webp`, `ecosystem/all.png` ("Shop by device" tile; device lineup keyed off black, lenses kept solid) |
| States | `states/order-confirmed.webp` (order placed), `states/rma-approved.webp` (for the returns flow) |
| Features | `features/cargo.webp`, `features/shield.webp` |

Colours from the brand guide: sapphire `#2563EB` is the primary (`--ig-blue`), cyan `#38BDF8` (`--ig-cyan`) and gold `#F59E0B` (`--ig-gold`) are light only, never text. The canvas stays light; cards are 28px frosted glass with a white rim and top catchlight.

## Trade desk (admin)

`/en/admin`, same tokens, glass cards, buttons and themes as the store, in a working layout: a frosted sidebar and wide content. Shared pieces live in `components/admin/Kit.tsx` (page header, panel, link tabs, empty state), `Fields.tsx` (native fields in the Medusa look, so forms post with server actions) and `Charts.tsx`.

| Area | Screens | Why it sits there |
| --- | --- | --- |
| Overview | Needs-attention counts (applications, orders to pick, overdue invoices, parts running low), 7-day figures with trend, revenue per day, revenue by part, grade mix, top accounts, latest orders, inline approvals | What needs a person comes first, then performance |
| Sell · Orders | Views by warehouse step and overdue payment, oldest first while open; "Start picking all new" in one press; each row moves its order one step (Pick, Packed, Delivered; Ship opens the order). The order page moves it on beside the progress bar, asks for carrier and tracking when shipping, keeps a history with notes, and confirms before cancelling. The buyer sees the same status and tracking on their order page | Fulfilment is a flow, so the next step is the main button |
| Sell · Customers | Applications (oldest first), Approved, Suspended, Declined; the customer page approves with a tier, declines with a reason, changes tier, suspends (decline and suspend confirm first), and links to the next application in the queue. On the overview, an application whose VAT number failed can only be reviewed, not approved in one click | An application is a customer's first step, so approvals are a view of Customers, not a separate area |
| Catalogue · Products | Stock views, category filter, list price and a tier price per part; on Running low and Out of stock, book a delivery in from the row (Receive). The nav shows how many parts are low or out. Add product with a grouped model picker, a suggested SKU (checked for duplicates) and a per-tier price preview | |
| Catalogue · Categories | Parts, out of stock and 30-day sales per category; add a category, rename it, name one item, pick its glass icon, reorder it and show or hide it (`CategoryForm`, `lib/categories.ts`). Only added, empty categories can be deleted | The store's top bar, category pages, Add product and the product filters all read these settings, so a change here shows in the shop |
| Pricing · Price tiers | Trade, Trade Plus, Volume Partner, Distributor, plus custom tiers. Each: discount off list, quantity breaks, custom rules (category, grade family or one grade; negative to charge more), payment terms, minimum order, who qualifies, and a live price preview. Reset to defaults (confirmed). Category rules use the desk's category names | Tiers are calculated from one list price, so a price change is made once |

Charts follow the dataviz rules: one accent hue for a single series, 2px lines, 4px rounded bar ends on the baseline, a 2px gap between bars, a recessive grid, text in ink, and a hover tooltip. The grade mix is one hue from deep to pale with labels, never colour alone.

Prototype data: sample customers, 30 days of generated orders, and the trade desk's changes kept in cookies (`lib/admin/data.ts`). Production reads and writes the database, and the admin sits behind staff sign-in.

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
| `commerce/AddToOrder` | Add to order, in a table row or on the product page; ticks for a moment and the toast links to the order. Below the widest layout, product tables put it under the part name |
| `commerce/ReorderButton` | Buy again: an earlier order's parts back into the order (out-of-stock parts left out and named in the toast) |
| `commerce/NotifyMe` | "Email me when it's back" on an out-of-stock part; the account lists the alerts |
| `commerce/PrintButton` | Print invoice (print styles hide the header, footer and buttons) |
| `ui/SubmitButton` | Every server-action submit: pending, confirm, done toast |
| `ui/Chip`, `ui/SearchField`, `ui/EmptyState`, `ui/CheckDraw`, `ui/ListingSkeleton` | See Building blocks |
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

## Store flows (what a buyer can do)

- **Find:** search with suggestions from the first letter; parts overview; shop by device; a 404 that offers search, devices and all parts.
- **Choose:** every grade side by side on the product page, and "Also for the {model}" with the rest of the repair job. Out of stock: compare grades or ask for an email when it is back.
- **Order:** add from any product table (any screen width) or the product page; the order shows "Often added" parts for the same handsets; remove a line and undo it from the toast. Continue to checkout sits at the top.
- **Checkout:** four clickable steps; your reference (PO) and a note for the warehouse; the review cards each open their step to edit.
- **After:** the order page shows the warehouse status and tracking as the trade desk moves it, with Buy again, Print invoice and All orders at the top. The account lists orders with live status and Buy again, and the back-in-stock alerts.
- **Account:** signing in returns you to the page that asked; after applying, a one-time "Application sent" with what happens next.

## Preferences and the account (decided 29 Oct 2026)

Two kinds of setting, kept apart:

- **Preferences** belong to the person on this device, signed in or not: **Light / Dark** and **Language**. Cookies `ig_mode` and `ig_lang` (`src/lib/prefs.ts`), read on the server so there is no flash.
  - Light is the default. Dark is the Obsidian neon theme. Cobalt and Amber stay lab-only previews; choosing Light or Dark clears a lab preview.
  - 10 languages, each listed in its own script: English, Italiano, Deutsch, Français, Español, Português, Türkçe, 中文, العربية, اردو. Arabic and Urdu set `dir="rtl"` and mirror the layout. The text is English until translations land; choosing a language sets direction and is remembered.
  - Where: the right end of the blue top strip (`layout/PrefControls`, md and up), again in the Account menu, and under Account settings → Preferences. All three use the same hooks.
- **The account** is the trade relationship. The header's **Account menu** (`layout/AccountMenu`) shows the company and its status, Orders and alerts, Account settings, Hide prices on screen, Appearance, Language, and Sign out.
- **Account settings** (`/account/settings`): one page, a side nav that follows the scroll, one card per section.
  1. Company: as approved; changes are a request the trade desk reviews.
  2. Addresses: delivery and invoice (invoice falls back to delivery). Checkout and the account overview read these.
  3. Payment and credit: price list, credit limit, the payment methods checkout offers, where invoices are.
  4. Notifications: order updates, back-in-stock, price changes, new parts and offers.
  5. Sign-in and security: change password.
  6. Preferences: appearance, language, hide prices on screen.
- Not built, on purpose: team members (not wanted for now); prices with or without VAT.

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
