"use client";

import { useActionState } from "react";
import { placeOrderAction } from "./actions";

const FIELDS = [
  { name: "name", label: "Full name", autoComplete: "name" },
  { name: "line1", label: "Street address", autoComplete: "address-line1" },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "zip", label: "ZIP code", autoComplete: "postal-code" },
] as const;

export function CheckoutForm({ defaultName, stripeEnabled }: { defaultName: string; stripeEnabled: boolean }) {
  const [state, action, pending] = useActionState(placeOrderAction, undefined);
  return (
    <form action={action} className="card space-y-4 p-5" data-testid="checkout-form" noValidate>
      <h2 className="font-semibold">Shipping address</h2>
      {FIELDS.map((f) => (
        <div key={f.name}>
          <label htmlFor={`ship-${f.name}`} className="label">
            {f.label}
          </label>
          <input
            id={`ship-${f.name}`}
            name={f.name}
            autoComplete={f.autoComplete}
            defaultValue={f.name === "name" ? defaultName : undefined}
            className="input"
            aria-invalid={Boolean(state?.fieldErrors?.[f.name])}
            data-testid={`shipping-${f.name}`}
          />
          {state?.fieldErrors?.[f.name] && <p className="mt-1 text-sm text-red-600">{state.fieldErrors[f.name]}</p>}
        </div>
      ))}
      <div className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
        <p className="font-medium">Payment</p>
        {stripeEnabled ? (
          <p>You&apos;ll be redirected to Stripe (test mode) to pay. Use card 4242 4242 4242 4242.</p>
        ) : (
          <p data-testid="payment-simulated">Test mode: payment is simulated, no card needed.</p>
        )}
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-red-600" data-testid="checkout-error">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn-primary w-full" disabled={pending} data-testid="place-order">
        {pending ? "Processing payment…" : stripeEnabled ? "Continue to payment" : "Place order"}
      </button>
    </form>
  );
}
