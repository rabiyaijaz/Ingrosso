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

## Two looks, one token set

- **Working screens** (catalogue, product, order, account, apply): Medusa UI components (`Button`, `Table`, `Select`, `ProgressTabs`, `StatusBadge`…).
- **Marketing pages** (landing): flat, shadowless primitives in `src/components/marketing/Primitives.tsx`, following the taste skill's house rules. Both use the same tokens.

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
| `catalog/Grade` | `GradeBadge` and `GradeScale` (ten-step ladder) |
| `catalog/DeviceFinder` | Brand → Series → Model, as columns or as selects |
| `catalog/ProductTable` | Dense part listings |
| `catalog/Facets` | Grade filter bar and URL-based facet groups |
| `catalog/ListingView` | Full listing layout (device, category, search) |
| `catalog/GradeCompare` | All grades of one part side by side |
| `catalog/PartGlyph` | Drawn part stand-ins until product photography arrives |
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
