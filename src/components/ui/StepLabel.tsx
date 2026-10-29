import { CheckMini } from "@medusajs/icons"

// The inside of one step in a stepper (checkout, application): a numbered
// rounded-square badge that turns into a tick when done, the step name and a
// short hint. Styles in globals.css (.ig-steps, .ig-step__*).
export function StepLabel({ n, label, hint, done }: { n: number; label: string; hint?: string; done: boolean }) {
  return (
    <>
      <span className="ig-step__num" aria-hidden>{done ? <CheckMini /> : n}</span>
      <span className="ig-step__text">
        <span className="ig-step__label">{label}</span>
        {hint && <span className="ig-step__hint">{hint}</span>}
      </span>
    </>
  )
}
