import Link from "next/link"
import { clx } from "@medusajs/ui"

import { Button } from "@/components/ui/Button"
import { ShoppingCart, User } from "@medusajs/icons"
import { Logo } from "@/components/brand/Logo"
import { Figure } from "@/components/commerce/Figure"
import { getCategories } from "@/lib/categories"
import { readCart } from "@/lib/cart"
import { deviceTree, searchStarters } from "@/lib/public"
import { routes } from "@/lib/routes"
import { getIconStyle } from "@/lib/icon-style"
import { getViewer } from "@/lib/viewer"
import { CartButton } from "./CartButton"
import { CategoryNav } from "./CategoryNav"
import { DeviceMenu } from "./DeviceMenu"
import { SearchBox } from "./SearchBox"
import { StripTicker } from "./StripTicker"

export async function SiteHeader() {
  const viewer = await getViewer()
  const cart = await readCart()
  const units = cart.reduce((n, l) => n + l.qty, 0)
  const iconStyle = await getIconStyle()
  const starters = searchStarters()
  const categories = await getCategories()
  const signedIn = viewer.state !== "visitor"
  const canOrder = viewer.state === "approved" || viewer.state === "masked"

  return (
    // data-ui: the header is working-app chrome (Medusa look) on every page,
    // including the landing page, so it keeps its own field and button styles.
    <header data-ui className="relative z-30 bg-ui-bg-base">
      <div className="ig-surface-blue">
        <div className="mx-auto max-w-page px-[var(--ig-gutter)] txt-compact-small">
          <StripTicker canOrder={canOrder} />
        </div>
      </div>

      <div className="mx-auto flex h-[72px] max-w-page items-center gap-3 px-[var(--ig-gutter)] md:gap-5">
        <Logo />
        <DeviceMenu tree={deviceTree()} />
        <SearchBox starters={starters} className="hidden flex-1 md:block md:max-w-[640px]" />
        <div className="ml-auto flex items-center gap-2">
          {signedIn ? (
            <Button asChild variant="transparent" size="large">
              <Link href={routes.account()}>
                <User />
                <span className="hidden lg:inline">Account</span>
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="transparent" size="large" className="hidden sm:inline-flex">
                <Link href={routes.signIn()}>Sign in</Link>
              </Button>
              <Button asChild size="large">
                <Link href={routes.apply()}>
                  <span className="sm:hidden">Apply</span>
                  <span className="hidden sm:inline">Apply for trade</span>
                </Link>
              </Button>
            </>
          )}
          {canOrder && <CartButton lines={cart.length} units={units} />}
        </div>
      </div>

      <div className="px-[var(--ig-gutter)] pb-3 md:hidden">
        <SearchBox starters={starters} />
      </div>

      <CategoryNav categories={categories.filter((c) => c.visible).map(({ slug, plural, icon }) => ({ slug, plural, icon }))} iconStyle={iconStyle} />
    </header>
  )
}
