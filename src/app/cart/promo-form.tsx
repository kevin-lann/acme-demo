"use client";

import { useActionState } from "react";
import { applyPromoAction } from "@/app/actions/cart";

export function PromoForm() {
  const [state, action, pending] = useActionState(applyPromoAction, undefined);
  return (
    <form action={action} className="space-y-2" data-testid="promo-form">
      <label htmlFor="promo-code" className="label">
        Promo code
      </label>
      <div className="flex gap-2">
        <input id="promo-code" name="code" className="input" placeholder="SAVE10" autoComplete="off" data-testid="promo-input" />
        <button type="submit" className="btn-secondary" disabled={pending} data-testid="promo-apply">
          Apply
        </button>
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-red-600" data-testid="promo-error">
          {state.error}
        </p>
      )}
    </form>
  );
}
