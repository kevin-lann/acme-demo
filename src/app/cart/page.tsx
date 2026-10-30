import type { Metadata } from "next";
import Link from "next/link";
import { removePromoAction } from "@/app/actions/cart";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { CheckoutSteps } from "@/components/checkout-steps";
import { OrderSummary } from "@/components/order-summary";
import { requireUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { CartLineControls } from "./cart-line";
import { PromoForm } from "./promo-form";

export const metadata: Metadata = { title: "Cart" };

export default async function CartPage() {
  const user = await requireUser("/cart");
  const cart = await getCart(user.id);
  const inCart = cart.lines.map((l) => l.productId);
  const recommended = await db.product.findMany({
    where: { id: { notIn: inCart }, inStock: true },
    orderBy: { popularity: "desc" },
    take: 4,
  });

  return (
    <div className="space-y-6">
      <CheckoutSteps current="Cart" />
      <h1 className="text-2xl font-semibold">Your cart</h1>
      {cart.lines.length === 0 ? (
        <div className="card p-8 text-center" data-testid="cart-empty">
          <p className="mb-4 text-zinc-500">Your cart is empty.</p>
          <Link href="/search" className="btn-primary">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <ul className="card divide-y divide-zinc-200 dark:divide-zinc-800" data-testid="cart-lines">
            {cart.lines.map((line) => (
              <li
                key={line.productId}
                className="flex flex-wrap items-center gap-4 p-4"
                data-testid="cart-line"
                data-product-slug={line.slug}
              >
                {/* biome-ignore lint/performance/noImgElement: generated SVG */}
                <img src={`/img/${line.slug}/0`} alt="" className="h-16 w-16 rounded-lg" />
                <div className="min-w-40 flex-1">
                  <Link href={`/products/${line.slug}`} className="font-medium hover:underline" data-testid="cart-line-name">
                    {line.name}
                  </Link>
                  <p className="text-sm text-zinc-500">{formatPrice(line.priceCents)} each</p>
                </div>
                <CartLineControls productId={line.productId} name={line.name} quantity={line.quantity} />
                <p className="w-24 text-right font-medium" data-testid="cart-line-total">
                  {formatPrice(line.lineTotalCents)}
                </p>
              </li>
            ))}
          </ul>
          <OrderSummary cart={cart}>
            {cart.promoCode ? (
              <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
                <span role="status" data-testid="promo-applied">
                  {cart.promoCode} applied
                </span>
                <form action={removePromoAction}>
                  <button type="submit" className="underline" data-testid="promo-remove">
                    Remove
                  </button>
                </form>
              </div>
            ) : (
              <PromoForm />
            )}
            <Link href="/checkout" className="btn-primary w-full" data-testid="checkout-button">
              Checkout
            </Link>
          </OrderSummary>
        </div>
      )}

      {recommended.length > 0 && (
        <section>
          <h2 className="mb-3 font-semibold">You might also like</h2>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4" data-testid="recommended">
            {recommended.map((p) => (
              <li key={p.id} className="card space-y-2 p-4" data-testid="recommended-item" data-product-slug={p.slug}>
                {/* biome-ignore lint/performance/noImgElement: generated SVG */}
                <img src={`/img/${p.slug}/0`} alt="" className="aspect-square w-full rounded-lg" />
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-zinc-500">{formatPrice(p.priceCents)}</p>
                <AddToCartButton productId={p.id} returnTo="/cart" compact />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
