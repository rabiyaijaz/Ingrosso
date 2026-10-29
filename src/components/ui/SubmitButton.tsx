"use client"

import { useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"
import { toast, usePrompt } from "@medusajs/ui"
import { Button, type ButtonProps } from "./Button"

// The submit button for every form that posts to a server action. It shows
// the spinner while the action runs (so a double click can't run it twice),
// can ask first for anything that's hard to undo, and says it's done with a
// toast. Store and trade desk use the same one.
//
//   confirm  { title, description, confirmText } — asks before posting
//   done     toast text once the action has finished
export function SubmitButton({
  confirm,
  done,
  doneDescription,
  onClick,
  ...props
}: Omit<ButtonProps, "type"> & {
  confirm?: { title: string; description: string; confirmText?: string }
  done?: string
  doneDescription?: string
}) {
  const { pending } = useFormStatus()
  const prompt = usePrompt()
  const wasPending = useRef(false)

  // The message is taken when the post starts: by the time it finishes the
  // page has moved on and the button may already say the next step
  const message = useRef<{ done?: string; doneDescription?: string }>({})
  const say = useRef(() => {
    const m = message.current
    if (m.done) toast.success(m.done, m.doneDescription ? { description: m.doneDescription } : undefined)
  })

  useEffect(() => {
    if (pending && !wasPending.current) message.current = { done, doneDescription }
    if (wasPending.current && !pending) say.current()
    wasPending.current = pending
  }, [pending, done, doneDescription])
  // An action often removes its own button (the last new order picked, a
  // queue emptied); still say it's done
  useEffect(() => () => { if (wasPending.current) say.current() }, [])

  return (
    <Button
      {...props}
      type="submit"
      isLoading={pending || props.isLoading}
      onClick={async (e) => {
        onClick?.(e)
        if (!confirm) return
        // requestSubmit below posts without another click, so this only runs once
        e.preventDefault()
        const button = e.currentTarget
        const ok = await prompt({
          title: confirm.title,
          description: confirm.description,
          confirmText: confirm.confirmText ?? "Yes, continue",
          cancelText: "Keep it",
          variant: props.variant === "danger" ? "danger" : "confirmation",
        })
        if (ok) button.form?.requestSubmit(button)
      }}
    />
  )
}
