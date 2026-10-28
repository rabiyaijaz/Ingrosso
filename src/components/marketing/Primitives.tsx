import Link from "next/link"
import { clx } from "@medusajs/ui"

// Marketing-page primitives. Working screens use Medusa's Button, Heading and
// Text; landing pages use these so the flat, shadowless taste rules hold.

type Tone = "accent" | "ink" | "paper" | "quiet"

const TONES: Record<Tone, string> = {
  // ig-btn-* are hooks the colour themes (src/app/themes.css) style.
  accent: "ig-btn-primary bg-ig-blue text-ig-on-accent hover:bg-ig-blue-ink",
  ink: "ig-btn-secondary bg-ig-ink text-ig-on-ink hover:opacity-90",
  paper: "ig-btn-secondary bg-ig-paper text-ig-ink hover:bg-ig-surface",
  quiet: "ig-btn-secondary bg-ig-paper-2 text-ig-ink hover:bg-ig-paper",
}

export function PillLink({ href, tone = "accent", children, className }: { href: string; tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={clx(
        "inline-flex h-[52px] items-center justify-center gap-2 rounded-full px-7 text-[17px] font-medium transition-[background-color,transform] duration-200 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-ig-blue focus-visible:ring-offset-2",
        TONES[tone],
        className
      )}
    >
      {children}
    </Link>
  )
}

export const display = "text-[clamp(44px,5vw,80px)] leading-[0.98] tracking-[-0.04em] font-medium"
export const sectionTitle = "text-[clamp(34px,3.6vw,56px)] leading-[1.02] tracking-[-0.035em] font-medium"
export const statement = "text-[clamp(20px,1.7vw,24px)] leading-[1.4] tracking-[-0.01em]"
export const body = "text-[18px] leading-[1.55]"
export const small = "text-[15px] leading-[1.5]"
