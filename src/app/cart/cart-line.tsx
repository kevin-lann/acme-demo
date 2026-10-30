"use client";

import { useEffect, useState, useTransition } from "react";
import { removeItemAction, updateQuantityAction } from "@/app/actions/cart";

export function CartLineControls({ productId, name, quantity }: { productId: string; name: string; quantity: number }) {
  const [value, setValue] = useState(String(quantity));
  const [pending, startTransition] = useTransition();

  useEffect(() => setValue(String(quantity)), [quantity]);

  function update(next: number) {
    const fd = new FormData();
    fd.set("productId", productId);
    fd.set("quantity", String(next));
    setValue(String(Math.max(0, next)));
    startTransition(() => updateQuantityAction(fd));
  }

  function remove() {
    const fd = new FormData();
    fd.set("productId", productId);
    startTransition(() => removeItemAction(fd));
  }

  return (
    <div className="flex items-center gap-2" aria-busy={pending}>
      <div className="flex items-center rounded-lg border border-zinc-300 dark:border-zinc-700">
        <button
          type="button"
          className="px-3 py-1.5 disabled:opacity-40"
          aria-label={`Decrease quantity of ${name}`}
          onClick={() => update(quantity - 1)}
          disabled={pending || quantity <= 1}
          data-testid="qty-decrease"
        >
          −
        </button>
        <input
          type="number"
          min={1}
          max={99}
          value={value}
          aria-label={`Quantity of ${name}`}
          className="w-12 border-x border-zinc-300 bg-transparent py-1.5 text-center text-sm dark:border-zinc-700"
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => Number(value) !== quantity && Number(value) > 0 && update(Number(value))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && Number(value) > 0) update(Number(value));
          }}
          data-testid="qty-input"
        />
        <button
          type="button"
          className="px-3 py-1.5 disabled:opacity-40"
          aria-label={`Increase quantity of ${name}`}
          onClick={() => update(quantity + 1)}
          disabled={pending || quantity >= 99}
          data-testid="qty-increase"
        >
          +
        </button>
      </div>
      <button
        type="button"
        className="text-sm text-zinc-500 underline hover:text-red-600"
        onClick={remove}
        disabled={pending}
        data-testid="cart-remove"
      >
        Remove
      </button>
    </div>
  );
}
