import Stripe from "stripe";

/** Stripe is optional: without STRIPE_SECRET_KEY checkout uses a simulated payment step. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!key.startsWith("sk_test_")) {
    console.warn("[stripe] STRIPE_SECRET_KEY is not a test-mode key; ignoring it");
    return null;
  }
  return new Stripe(key);
}

export function appUrl(): string {
  return (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
