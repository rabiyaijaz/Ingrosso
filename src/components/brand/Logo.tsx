import Image from "next/image"
import Link from "next/link"
import { clx } from "@medusajs/ui"
import { routes } from "@/lib/routes"

type LogoProps = { tone?: "light" | "dark"; size?: "sm" | "md"; href?: string | null; className?: string }

// The crystal "I" mark plus the wordmark set in the UI face. One component,
// used everywhere the brand shows. The mark is the frosted silver glass
// edition (blue crystal "I", soft warm core), which reads on light, blue and dark grounds;
// tone only sets the wordmark colour.
export function Logo({ tone = "light", size = "md", href = routes.home(), className }: LogoProps) {
  const mark = size === "sm" ? 28 : 34
  const body = (
    <span className={clx("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/brand/logo-mark.webp"
        alt=""
        width={mark}
        height={mark}
        className="shrink-0"
        style={{ width: mark, height: mark }}
        priority
      />
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
