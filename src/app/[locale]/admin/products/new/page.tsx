import { AdminHeader } from "@/components/admin/Kit"
import { ProductForm } from "@/components/admin/ProductForm"
import { getTiers } from "@/lib/admin/data"
import { CATEGORIES, GRADES } from "@/lib/catalog"
import { deviceTree } from "@/lib/public"
import { routes } from "@/lib/routes"

export const metadata = { title: "Add product" }

export default async function NewProductPage() {
  const tiers = await getTiers()
  return (
    <>
      <AdminHeader
        crumbs={[{ label: "Products", href: routes.admin.products() }]}
        title="Add product"
        description="One part in one grade. It is listed under every model you pick, and priced for each tier from the list price."
      />
      <ProductForm tree={deviceTree()} grades={GRADES} categories={CATEGORIES} tiers={tiers} />
    </>
  )
}
