"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@medusajs/ui"
import { signOut } from "@/app/actions"
import { routes } from "@/lib/routes"

export function SignOutButton() {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <Button
      variant="secondary"
      isLoading={pending}
      onClick={() =>
        start(async () => {
          await signOut()
          router.push(routes.home())
        })
      }
    >
      Sign out
    </Button>
  )
}
