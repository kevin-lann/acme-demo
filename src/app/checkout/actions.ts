"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { clearCart, getCart } from "@/lib/cart";
import { createOrder, type ShippingAddress } from "@/lib/orders";
import { appUrl, getStripe } from "@/lib/stripe";

export type CheckoutState = { error?: string; fieldErrors?: Partial<Record<keyof ShippingAddress, string>> } | undefined;

export async function placeOrderAction(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) redirect("/login?callbackUrl=/checkout");

  const shipping: ShippingAddress = {
    name: String(formData.get("name") ?? "").trim(),
    line1: String(formData.get("line1") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    zip: String(formData.get("zip") ?? "").trim(),
  };
  const fieldErrors: NonNullable<CheckoutState>["fieldErrors"] = {};
  if (!shipping.name) fieldErrors.name = "Name is required";
  if (!shipping.line1) fieldErrors.line1 = "Address is required";
  if (!shipping.city) fieldErrors.city = "City is required";
  if (!/^\d{5}(-\d{4})?$/.test(shipping.zip)) fieldErrors.zip = "Enter a 5-digit ZIP code";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const cart = await getCart(userId);
  if (cart.lines.length === 0) return { error: "Your cart is empty." };

  const lines = cart.lines.map((l) => ({ productId: l.productId, quantity: l.quantity, priceCents: l.priceCents }));
  const base = {
    userId,
    lines,
    subtotalCents: cart.subtotalCents,
    discountCents: cart.discountCents,
    totalCents: cart.totalCents,
    promoCode: cart.promoCode,
    shipping,
  };

  const stripe = getStripe();
  if (stripe) {
    let url: string | null;
    try {
      const coupon = cart.discountPercent
        ? await stripe.coupons.create({ percent_off: cart.discountPercent, duration: "once", name: cart.promoCode ?? undefined })
        : null;
      const checkout = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: cart.lines.map((l) => ({
          quantity: l.quantity,
          price_data: { currency: "usd", unit_amount: l.priceCents, product_data: { name: l.name } },
        })),
        discounts: coupon ? [{ coupon: coupon.id }] : undefined,
        customer_email: session?.user?.email ?? undefined,
        success_url: `${appUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl()}/checkout`,
      });
      await createOrder({ ...base, status: "pending", stripeSession: checkout.id });
      url = checkout.url;
    } catch (e) {
      console.error("[checkout] Stripe error", e);
      return { error: "Payment provider is unavailable. Please try again." };
    }
    if (url) redirect(url);
    return { error: "Payment provider did not return a checkout page." };
  }

  // No Stripe key: simulated test-mode payment.
  await new Promise((r) => setTimeout(r, 800));
  const order = await createOrder({ ...base, status: "paid" });
  await clearCart(userId);
  redirect(`/checkout/success?order=${order.number}`);
}
