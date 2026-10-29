import { notFound } from "next/navigation"
import { AdminHeader } from "@/components/admin/Kit"
import { TierEditor } from "@/components/admin/TierEditor"
import { SAMPLE_PARTS, getCustomers, getTiers, type Tier } from "@/lib/admin/data"
import { CATEGORIES, GRADES, productBySlug } from "@/lib/catalog"
import { listPrice } from "@/lib/commerce"
import { routes } from "@/lib/routes"

const BLANK: Tier = {
  id: "new",
  name: "",
  description: "",
  discount: 5,
  breaks: [{ minQty: 5, pct: 3 }, { minQty: 10, pct: 6 }, { minQty: 25, pct: 10 }],
  rules: [],
  minOrder: 0,
  terms: "prepay",
  eligibility: "",
}

export default async function TierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [tiers, customers] = await Promise.all([getTiers(), getCustomers()])
  const tier = id === "new" ? BLANK : tiers.find((t) => t.id === id)
  if (!tier) notFound()
  const inUse = customers.filter((c) => c.tierId === id && (c.status === "approved" || c.status === "suspended")).length
  const first = tiers[0]?.id === id
  // Only the figures the preview needs: name, category, grade, list price
  const parts = SAMPLE_PARTS.map((s) => productBySlug(s)).filter((p) => !!p).map((p) => ({ name: p!.name, category: p!.category, grade: p!.grade, list: listPrice(p!) }))

  return (
    <>
      <AdminHeader
        crumbs={[{ label: "Price tiers", href: routes.admin.pricing() }]}
        title={id === "new" ? "New price tier" : tier.name}
        description={id === "new" ? "Start from the standard breaks and adjust. Assign it to accounts from their customer page." : `${inUse} account${inUse === 1 ? "" : "s"} on this tier.`}
      />
      <TierEditor
        key={id}
        tier={tier}
        categories={CATEGORIES.map((c) => ({ value: c.slug, label: c.plural }))}
        grades={GRADES.map((g) => ({ value: g.id, label: `${g.label} (${g.family})` }))}
        parts={parts}
        canDelete={!first && inUse === 0}
        deleteReason={first ? "The first tier is where new accounts start, so it stays." : `Move the ${inUse} account${inUse === 1 ? "" : "s"} on this tier first.`}
      />
    </>
  )
}
