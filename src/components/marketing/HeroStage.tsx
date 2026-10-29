"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { clx } from "@medusajs/ui"
import { MotionScene } from "./MotionScene"

export type StageImage = { src: string; alt: string; position?: string }

// The fixed half of the split stage. Its picture crossfades to the one that
// matches whichever [data-stage] block is in view in the reading column, and
// lives inside a MotionScene (focus-in, breathing, glow, light, parallax).
export function HeroStage({ images, caption }: { images: StageImage[]; caption: React.ReactNode }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const blocks = document.querySelectorAll<HTMLElement>("[data-stage]")
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number(e.target.getAttribute("data-stage")))
      },
      { rootMargin: "-45% 0px -45% 0px" }
    )
    blocks.forEach((b) => io.observe(b))
    return () => io.disconnect()
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-panel bg-ig-slate">
      <MotionScene>
        {images.map((img, i) => (
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority={i === 0}
            className={clx(
              "object-cover transition-opacity ease-in-out motion-reduce:transition-none",
              i === active ? "opacity-100" : "opacity-0"
            )}
            style={{ objectPosition: img.position ?? "center", transitionDuration: "1600ms" }}
          />
        ))}
      </MotionScene>
      <div className="ig-stage-caption absolute inset-x-3 bottom-3 z-10 flex min-h-12 flex-wrap items-center justify-between gap-x-6 gap-y-1 rounded-2xl px-5 py-3 text-[15px] text-ig-ink">
        {caption}
      </div>
    </div>
  )
}
