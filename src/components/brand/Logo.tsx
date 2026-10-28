import Image from "next/image"
import Link from "next/link"
import { clx } from "@medusajs/ui"
import { routes } from "@/lib/routes"

type LogoProps = { tone?: "light" | "dark"; size?: "sm" | "md"; href?: string | null; className?: string }

// The crystal "I" mark from the brand file, cropped to its squircle, plus the
// wordmark set in the UI face. One component, used everywhere the brand shows.
export function Logo({ tone = "light", size = "md", href = routes.home(), className }: LogoProps) {
  const mark = size === "sm" ? 28 : 34
  const body = (
    <span className={clx("inline-flex items-center gap-2.5", className)}>
      <span
        className="relative inline-block shrink-0 overflow-hidden"
        style={{ width: mark, height: mark, borderRadius: mark * 0.28 }}
      >
        <Image
          src="/brand/mark-dark.webp"
          alt=""
          width={mark * 2}
          height={mark * 2}
          className="absolute inset-0 h-full w-full scale-[1.42] object-cover"
          priority
        />
      </span>
      <span
        className={clx(
          "font-medium tracking-[-0.03em]",
          size === "sm" ? "text-[18px]" : "text-[21px]",
          tone === "light" ? "text-ig-ink" : "text-ig-on-slate"
        )}
      >
        Ingrosso
      </span>
    </span>
  )
  if (!href) return body
  return (
    <Link href={href} aria-label="Ingrosso home" className="rounded-md focus-visible:shadow-borders-focus outline-none">
      {body}
    </Link>
  )
}
