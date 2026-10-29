import Image from "next/image"
import { clx } from "@medusajs/ui"

// The simple logo as a section picture: the crystal mark floating over soft
// caustic light. tone="light" on the light canvas (sapphire mark),
// tone="dark" on deep blue (clear-glass mark). Styles: .ig-logo-stage.
export function LogoStage({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <div className={clx("ig-logo-stage", className)} data-tone={tone}>
      <span aria-hidden className="ig-logo-stage__ring" />
      <span aria-hidden className="ig-logo-stage__ring ig-logo-stage__ring--2" />
      <Image
        src={tone === "light" ? "/brand/logo-light.webp" : "/brand/logo-dark.webp"}
        alt="The Ingrosso mark"
        width={256}
        height={256}
        className="ig-logo-stage__mark"
      />
    </div>
  )
}
