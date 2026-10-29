import Image from "next/image"
import { clx } from "@medusajs/ui"

// The simple logo as a section picture: the main (golden-core) mark floating
// over soft caustic light. tone sets the ground: light canvas or deep blue.
// Styles: .ig-logo-stage.
export function LogoStage({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <div className={clx("ig-logo-stage", className)} data-tone={tone}>
      <span aria-hidden className="ig-logo-stage__ring" />
      <span aria-hidden className="ig-logo-stage__ring ig-logo-stage__ring--2" />
      <Image
        src="/brand/logo-mark.webp"
        alt="The Ingrosso mark"
        width={256}
        height={256}
        className="ig-logo-stage__mark"
      />
    </div>
  )
}
