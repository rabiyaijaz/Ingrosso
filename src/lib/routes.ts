// Every internal URL is built here, so locale-prefixed paths (/en, /nl, /ar)
// stay consistent across the app (BRD 3.4).
export const LOCALES = ["en"] as const
export type Locale = (typeof LOCALES)[number]

const q = (params?: Record<string, string | undefined>) => {
  if (!params) return ""
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString()
  return s ? `?${s}` : ""
}

export const routes = {
  home: (l: string = "en") => `/${l}`,
  devices: (l: string = "en") => `/${l}/devices`,
  parts: (l: string = "en") => `/${l}/parts`,
  brand: (brand: string, l: string = "en") => `/${l}/devices/${brand}`,
  series: (brand: string, series: string, l: string = "en") => `/${l}/devices/${brand}/${series}`,
  model: (brand: string, series: string, model: string, params?: Record<string, string | undefined>, l: string = "en") =>
    `/${l}/devices/${brand}/${series}/${model}${q(params)}`,
  category: (cat: string, params?: Record<string, string | undefined>, l: string = "en") => `/${l}/c/${cat}${q(params)}`,
  product: (slug: string, l: string = "en") => `/${l}/p/${slug}`,
  search: (query: string, l: string = "en") => `/${l}/search${q({ q: query })}`,
  grades: (l: string = "en") => `/${l}/grades`,
  apply: (l: string = "en") => `/${l}/apply`,
  signIn: (l: string = "en") => `/${l}/sign-in`,
  cart: (l: string = "en") => `/${l}/cart`,
  checkout: (l: string = "en") => `/${l}/checkout`,
  order: (ref: string, l: string = "en") => `/${l}/orders/${ref}`,
  account: (l: string = "en") => `/${l}/account`,
  system: (l: string = "en") => `/${l}/system`,
  admin: {
    home: (l: string = "en") => `/${l}/admin`,
    orders: (params?: Record<string, string | undefined>, l: string = "en") => `/${l}/admin/orders${q(params)}`,
    order: (ref: string, l: string = "en") => `/${l}/admin/orders/${ref}`,
    customers: (params?: Record<string, string | undefined>, l: string = "en") => `/${l}/admin/customers${q(params)}`,
    customer: (id: string, l: string = "en") => `/${l}/admin/customers/${id}`,
    products: (params?: Record<string, string | undefined>, l: string = "en") => `/${l}/admin/products${q(params)}`,
    newProduct: (l: string = "en") => `/${l}/admin/products/new`,
    categories: (l: string = "en") => `/${l}/admin/categories`,
    category: (slug: string, l: string = "en") => `/${l}/admin/categories/${slug}`,
    pricing: (l: string = "en") => `/${l}/admin/pricing`,
    tier: (id: string, l: string = "en") => `/${l}/admin/pricing/${id}`,
  },
}
