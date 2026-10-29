"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Hint, Input, Label } from "@medusajs/ui"
import { Envelope, Key } from "@medusajs/icons"
import { Button } from "@/components/ui/Button"
import { WithIcon } from "@/components/ui/WithIcon"
import { setViewerState } from "@/app/actions"
import { LAB } from "@/lib/lab"
import { routes } from "@/lib/routes"

// Prototype sign-in: signs in as the sample approved account. Real
// authentication replaces the action when the backend is connected.
export function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        if (!LAB && (!email || !password)) return setError("Enter your email and password")
        start(async () => {
          await setViewerState("approved")
          router.push(routes.account())
        })
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" size="small" weight="plus">Work email</Label>
        <WithIcon icon={<Envelope />}>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </WithIcon>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password" size="small" weight="plus">Password</Label>
        <WithIcon icon={<Key />}>
          <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </WithIcon>
      </div>
      {error && <Hint variant="error">{error}</Hint>}
      <Button size="large" type="submit" isLoading={pending}>Sign in</Button>
      <p className="txt-small text-ui-fg-subtle">
        No trade account yet? <Link href={routes.apply()} className="text-ui-fg-interactive hover:underline">Apply in about five minutes</Link>
      </p>
    </form>
  )
}
