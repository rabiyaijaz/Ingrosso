# Design system and flow audit (29 Oct 2026)

Done in the lab (`lab` branch, http://localhost:3311). Nothing is pushed: say **confirm** to merge into `main` and deploy. The rules that came out of it are in `DESIGN.md` (Tabs, Building blocks, Motion and feedback, Store flows, Trade desk). Every new component is shown live at `/en/system`.

## 1. One design system

What the audit found, and what each became:

| Found | Now |
| --- | --- |
| 4 kinds of tabs (checkout steps, trade desk views, grade families twice, Add product's brands), each built by hand | **2 kinds:** segmented tabs (`.ig-steps`) for steps, views and pickers; icon tabs (`.ig-icontabs`) for the grade families on listings and the landing page |
| 12 hand-built chip styles with 3 different "selected" looks | One `ui/Chip`: sizes 32/36/40, one selected look (accent wash, accent text, accent rim) |
| 5 card recipes (`rounded-2xl`, `rounded-xl`, Medusa `Container`, `rounded-panel`), copied in 40 places | One `.ig-card` (+ `.ig-card-hover`), one `.ig-inset` for sub-panels. `Panel` uses it. |
| 5 search fields | One `ui/SearchField` (the two typeaheads stay as they are) |
| 4 empty states | One `ui/EmptyState` |
| Page titles at 28, 30 and 32px set by hand | One `.ig-page-title` (32, compact 28) |
| The trade desk's own breadcrumb | The store's `Breadcrumbs` everywhere |
| Buttons built by copying `.ig-btn`; "Sign in" as a ghost text button; extra `rounded-full` overrides | Shared `Button` everywhere; Sign in is white (secondary); overrides removed |
| Raw buttons on the categories page | `SubmitButton` (ghost) |
| Visible scrollbars on 4 trade desk tables | Hidden (`.ig-no-scrollbar`) |
| Server-action forms with no feedback: a double click could move an order two steps | `ui/SubmitButton` on every one: spinner, confirm for anything hard to undo, done toast |

## 2. Flows

**Buyer**

- **Buy again:** from the order page, every placed order in the account, and an empty order ("Order IG-… again"). Out-of-stock parts are left out and named in the toast.
- **Out of stock:** "Email me when it's back" instead of a dead end. The account lists the alerts.
- **Live order status:** the trade desk's steps and tracking number show on the buyer's order page and account.
- **Order page:** progress bar, tracking, Print invoice (clean print styles), part names link to the part.
- **Finish the repair in one order:**
  - "Also for the {model}" on the product page.
  - "Often added" in the order.
- **Add to order on every screen size:** it used to be hidden below 1280px.
- **Cart:**
  - Removing a line can be undone.
  - The line dims while it updates.
  - Continue to checkout is at the top on every screen.
- **Checkout:**
  - New note for the warehouse.
  - Every review card opens its step to edit.
  - Removed the promise of an address book that didn't exist.
- **Sign in:** returns you to the page that asked. "Signed in" toast.
- **After applying:** a one-time "Application sent" with what happens next.
- **When something goes wrong:**
  - A real 404 with search.
  - An error page with Try again.
  - Loading skeletons on listings.
- **Fixed:** search filters broke when the search box was empty (the links had no `?`).

**Trade desk**

- **Orders:**
  - Oldest first while open.
  - "Start picking all N new" in one press.
  - Each row moves its order one step.
  - Shipping asks for carrier and tracking.
  - A history panel with notes.
  - Cancelling asks first.
- **Applications:**
  - Oldest first.
  - "Next application" link after a decision.
  - Decline and suspend ask first.
  - On the overview, an application with a failed VAT check can only be reviewed, not approved in one click.
- **Stock:** "Receive" books a delivery in from the Running low and Out of stock views. The nav counts parts low or out.
- **Tiers:**
  - Reset to defaults (asks first).
  - Delete tier and category ask first.
  - Rules use the desk's own category names.
- **Fixed:** a hydration error on the products list (a badge inside a `<p>`).

## 3. Interactions

| Interaction | Where |
| --- | --- |
| Progress bars fill step by step | Store order page, trade desk order |
| Tick that draws itself | Order placed, application sent |
| Step panels slide in | Checkout, application |
| Line total flashes when the quantity changes the price | Product page |
| Add button shows "Added ✓" | Every Add button |
| Toast with "View order" | After adding a part |
| Header badge pops on every add | Header (it used to pop only for a new line) |
| Nav counts pop when a queue changes | Trade desk nav |
| History lines fade in | Trade desk order |

Every animation is off when the system asks for reduced motion.

## 4. Not done (needs a decision, or larger)

**Design calls**

- The quantity stepper has square corners while every other control is a pill. Should it become a pill?
- Filter checkboxes come in three slightly different styles (`Pieces`, `Facets`, `ListingView`). Merge them once a listing layout is chosen.

**Larger pieces of work**

- One shared table for the 9 hand-built trade desk tables.
- One `Tag` for counts and deltas (nav counts, KPI changes).

**Trade desk**

- Edit an existing product. Today you can only add products and book stock in.
- Bulk select with checkboxes.
- Credit terms and a credit limit per account.
- An activity log.
- Keyboard shortcuts.
- A packing slip.
- Drag to reorder categories.
- A warning before leaving the tier editor with unsaved changes.
- Add product keeps only the 8 newest added parts, because the prototype stores them in a cookie.

**Store**

- Quick order by pasting SKUs.
- Saved parts lists.
- Recently viewed.
- An address book.
- A sticky add-to-order bar on phones.

**Prototype limits**

- Stock booked in on the trade desk doesn't change the store's stock yet.
- Alerts don't send email. Production needs the backend for both.
