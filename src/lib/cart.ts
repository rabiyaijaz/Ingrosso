import { cookies } from "next/headers"
import { productBySlug, type Product } from "./catalog"
import { LAB } from "./lab"

export const CART_COOKIE = LAB ? "ig_lab_cart" : "ig_cart"

export type CartLine = { slug: string; qty: number }

export async function readCart(): Promise<CartLine[]> {
  const raw = (await cookies()).get(CART_COOKIE)?.value
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as CartLine[]
    return parsed.filter((l) => productBySlug(l.slug) && Number.isInteger(l.qty) && l.qty > 0)
  } catch {
    return []
  }
}

export async function cartWithProducts(): Promise<{ line: CartLine; product: Product }[]> {
  return (await readCart()).map((line) => ({ line, product: productBySlug(line.slug)! }))
}
