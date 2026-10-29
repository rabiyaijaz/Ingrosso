import { notFound } from "next/navigation"
import { CategoryForm } from "@/components/admin/CategoryForm"
import { AdminHeader } from "@/components/admin/Kit"
import { getAdminProducts } from "@/lib/admin/data"
import { getCategories } from "@/lib/categories"
import { routes } from "@/lib/routes"

const BLANK = { slug: "new", name: "", plural: "", icon: "small-parts", visible: true }

export default async function CategoryEditPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ error?: string }> }) {
  const { slug } = await params
  const { error } = await searchParams
  const [list, products] = await Promise.all([getCategories(), getAdminProducts()])
  const category = slug === "new" ? BLANK : list.find((c) => c.slug === slug)
  if (!category) notFound()
  const parts = products.filter((p) => p.category === slug).length
  const canDelete = !!("custom" in category && category.custom) && parts === 0

  return (
    <>
      <AdminHeader
        crumbs={[{ label: "Categories", href: routes.admin.categories() }]}
        title={slug === "new" ? "Add category" : category.plural}
        description={slug === "new" ? "A new part category. Add products to it from Add product." : `${parts} part${parts === 1 ? "" : "s"} in this category.`}
      />
      <CategoryForm
        key={slug}
        category={category}
        error={error}
        canDelete={canDelete}
        deleteReason={"custom" in category && category.custom ? "Move or remove its parts first." : "The starting categories stay; hide one instead."}
      />
    </>
  )
}
