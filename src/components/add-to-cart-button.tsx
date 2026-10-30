"use client";

import { useActionState } from "react";
import { addToCartAction } from "@/app/actions/cart";

export function AddToCartButton({
  productId,
  returnTo,
  disabled,
  compact,
}: {
  productId: string;
  returnTo: string;
  disabled?: boolean;
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState(addToCartAction, undefined);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <button
        type="submit"
        className={compact ? "btn-secondary" : "btn-primary w-full sm:w-auto"}
        disabled={disabled || pending}
        data-testid="add-to-cart"
      >
        {disabled ? "Out of stock" : pending ? "Adding…" : "Add to cart"}
      </button>
      {state?.message && (
        <p role="status" className="text-sm text-green-700 dark:text-green-400" data-testid="add-to-cart-status">
          {state.message}
        </p>
      )}
      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
