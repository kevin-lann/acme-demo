import type { Cart } from "@/lib/cart";
import { formatPrice } from "@/lib/money";

export function OrderSummary({ cart, children }: { cart: Cart; children?: React.ReactNode }) {
  return (
    <aside className="card space-y-3 p-5" data-testid="order-summary">
      <h2 className="font-semibold">Order summary</h2>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd data-testid="summary-subtotal">{formatPrice(cart.subtotalCents)}</dd>
        </div>
        {cart.promoCode && (
          <div className="flex justify-between text-green-700 dark:text-green-400">
            <dt>
              Discount ({cart.promoCode}, {cart.discountPercent}%)
            </dt>
            <dd data-testid="summary-discount">−{formatPrice(cart.discountCents)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd>Free</dd>
        </div>
        <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold dark:border-zinc-800">
          <dt>Total</dt>
          <dd data-testid="summary-total">{formatPrice(cart.totalCents)}</dd>
        </div>
      </dl>
      {children}
    </aside>
  );
}
