import "server-only"
import { cookies } from "next/headers"
import { CATEGORIES } from "./catalog"
import { LAB } from "./lab"
import type { AdminCategory } from "./admin/types"

// Part categories as the trade desk last arranged them: names, icon, order
// and whether each shows in the store's top bar. Prototype: kept in a cookie;
// production reads the categories table.

export const CATEGORIES_COOKIE = LAB ? "ig_lab_admin_categories" : "ig_admin_categories"

export const DEFAULT_CATEGORIES: AdminCategory[] = CATEGORIES.map((c) => ({ ...c, icon: c.slug, visible: true }))

export async function getCategories(): Promise<AdminCategory[]> {
  const raw = (await cookies()).get(CATEGORIES_COOKIE)?.value
  if (!raw) return DEFAULT_CATEGORIES
  try {
    return JSON.parse(raw) as AdminCategory[]
  } catch {
    return DEFAULT_CATEGORIES
  }
}

export async function getCategory(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug)
}
