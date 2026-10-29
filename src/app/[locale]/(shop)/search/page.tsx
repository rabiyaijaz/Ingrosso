import { ListingView } from "@/components/catalog/ListingView"
import { PageContainer, PageHeading } from "@/components/layout/Page"
import { searchProducts } from "@/lib/public"
import { routes } from "@/lib/routes"
import { getViewer } from "@/lib/viewer"

export const metadata = { title: "Search" }

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const q = (sp.q ?? "").slice(0, 80)
  const viewer = await getViewer()
  const products = searchProducts(q)

  return (
    <PageContainer className="flex flex-col gap-8 pt-8">
      <PageHeading
        title={q ? `Results for “${q}”` : "Search"}
        description="Search matches part names, model codes such as A3526 or SM-S938B, and SKUs."
      />
      <ListingView
        products={products}
        viewer={viewer}
        params={{ grade: sp.grade, cat: sp.cat, brand: sp.brand, model: sp.model, find: sp.find, fam: sp.fam, stock: sp.stock, sort: sp.sort, view: sp.view }}
        hrefFor={(fp) => {
          // One query string, whether or not there is a search term (an empty q has no "?")
          const qs = new URLSearchParams(Object.entries({ q, ...fp }).filter((e): e is [string, string] => !!e[1]))
          return `${routes.search("")}${qs.size ? `?${qs}` : ""}`
        }}
        facets={["cat", "brand"]}
      />
    </PageContainer>
  )
}
