import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutSteps } from "@/components/checkout-steps";
import { requireUser } from "@/lib/auth";
import { clearCart } from "@/lib/cart";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "Order confirmed" };

type Props = { searchParams: Promise<{ order?: string; session_id?: string }> };

export default async function SuccessPage({ searchParams }: Props) {
  const user = await requireUser("/orders");
  const { order: orderParam, session_id } = await searchParams;

  let order = orderParam
    ? await db.order.findFirst({ where: { number: Number(orderParam), userId: user.id } })
    : session_id
      ? await db.order.findFirst({ where: { stripeSession: session_id, userId: user.id } })
      : null;

  // Stripe return: confirm payment and clear the cart.
  if (order && session_id && order.status === "pending") {
    const stripe = getStripe();
    const checkout = stripe ? await stripe.checkout.sessions.retrieve(session_id).catch(() => null) : null;
    if (checkout?.payment_status === "paid") {
      order = await db.order.update({ where: { id: order.id }, data: { status: "paid" } });
      await clearCart(user.id);
    }
  }

  if (!order) {
    return (
      <div className="card p-8 text-center">
        <p>We couldn&apos;t find that order.</p>
        <Link href="/orders" className="btn-secondary mt-4">
          View orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CheckoutSteps current="Done" />
      <div className="card space-y-3 p-8 text-center" data-testid="order-confirmation">
        <h1 className="text-2xl font-semibold">Thanks for your order!</h1>
        <p>
          Order <span className="font-mono" data-testid="order-number">#{order.number}</span> ·{" "}
          {formatPrice(order.totalCents)} · <span data-testid="order-status">{order.status === "paid" ? "Paid" : "Payment pending"}</span>
        </p>
        <div className="flex justify-center gap-2 pt-2">
          <Link href="/orders" className="btn-primary" data-testid="view-orders">
            View order history
          </Link>
          <Link href="/" className="btn-secondary">
            Keep shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
