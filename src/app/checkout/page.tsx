import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutSteps } from "@/components/checkout-steps";
import { OrderSummary } from "@/components/order-summary";
import { requireUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { getStripe } from "@/lib/stripe";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const cart = await getCart(user.id);
  if (cart.lines.length === 0) redirect("/cart");

  return (
    <div className="space-y-6">
      <CheckoutSteps current="Shipping" />
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <CheckoutForm defaultName={user.name} stripeEnabled={Boolean(getStripe())} />
        <OrderSummary cart={cart}>
          <ul className="space-y-1 border-t border-zinc-200 pt-3 text-sm text-zinc-500 dark:border-zinc-800">
            {cart.lines.map((l) => (
              <li key={l.productId} className="flex justify-between">
                <span>
                  {l.name} × {l.quantity}
                </span>
              </li>
            ))}
          </ul>
        </OrderSummary>
      </div>
    </div>
  );
}
