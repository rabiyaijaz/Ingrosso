import Link from "next/link"
import { Button } from "@/components/ui/Button"

// Marketing-page primitives. Buttons are the shared Button (components/ui),
// so landing pages and working screens use the same button everywhere.

// accent = the main blue button, paper = the white button.
type Tone = "accent" | "paper"

const VARIANT = { accent: "primary", paper: "secondary" } as const

export function PillLink({
  href,
  tone = "accent",
  iconLeft,
  iconRight,
  children,
  className,
}: {
  href: string
  tone?: Tone
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Button asChild size="xl" variant={VARIANT[tone]} iconLeft={iconLeft} iconRight={iconRight} className={className}>
      <Link href={href}>{children}</Link>
    </Button>
  )
}

export const display = "text-[clamp(44px,5vw,80px)] leading-[0.98] tracking-[-0.04em] font-medium"
export const sectionTitle = "text-[clamp(34px,3.6vw,56px)] leading-[1.02] tracking-[-0.035em] font-medium"
export const statement = "text-[clamp(20px,1.7vw,24px)] leading-[1.4] tracking-[-0.01em]"
export const body = "text-[18px] leading-[1.55]"
export const small = "text-[15px] leading-[1.5]"
