import { db } from "./db";
import { redis } from "./redis";

export const PROMO_CODES: Record<string, number> = { SAVE10: 10 };
const CART_TTL_SECONDS = 60 * 60 * 24 * 30;

const itemsKey = (userId: string) => `cart:${userId}:items`;
const promoKey = (userId: string) => `cart:${userId}:promo`;

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  quantity: number;
  lineTotalCents: number;
};

export type Cart = {
  lines: CartLine[];
  itemCount: number;
  subtotalCents: number;
  promoCode: string | null;
  discountPercent: number;
  discountCents: number;
  totalCents: number;
};

export async function getCart(userId: string): Promise<Cart> {
  const [raw, promo] = await Promise.all([redis.hgetall(itemsKey(userId)), redis.get(promoKey(userId))]);
  const ids = Object.keys(raw);
  const products = ids.length ? await db.product.findMany({ where: { id: { in: ids } } }) : [];
  const lines = products
    .map((p) => {
      const quantity = Number(raw[p.id]);
      return {
        productId: p.id,
        slug: p.slug,
        name: p.name,
        priceCents: p.priceCents,
        quantity,
        lineTotalCents: p.priceCents * quantity,
      };
    })
    .filter((l) => l.quantity > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  const subtotalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);
  const discountPercent = promo ? (PROMO_CODES[promo] ?? 0) : 0;
  const discountCents = Math.round((subtotalCents * discountPercent) / 100);
  return {
    lines,
    itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
    subtotalCents,
    promoCode: discountPercent ? promo : null,
    discountPercent,
    discountCents,
    totalCents: subtotalCents - discountCents,
  };
}

async function touch(userId: string) {
  await redis.expire(itemsKey(userId), CART_TTL_SECONDS);
}

export async function addToCart(userId: string, productId: string, quantity = 1) {
  await redis.hincrby(itemsKey(userId), productId, quantity);
  await touch(userId);
}

export async function setQuantity(userId: string, productId: string, quantity: number) {
  if (quantity <= 0) await redis.hdel(itemsKey(userId), productId);
  else await redis.hset(itemsKey(userId), productId, String(Math.min(quantity, 99)));
  await touch(userId);
}

export async function applyPromo(userId: string, code: string): Promise<boolean> {
  const normalized = code.trim().toUpperCase();
  if (!(normalized in PROMO_CODES)) return false;
  await redis.set(promoKey(userId), normalized, "EX", CART_TTL_SECONDS);
  return true;
}

export async function removePromo(userId: string) {
  await redis.del(promoKey(userId));
}

export async function clearCart(userId: string) {
  await redis.del(itemsKey(userId), promoKey(userId));
}

export async function cartCount(userId: string): Promise<number> {
  const raw = await redis.hvals(itemsKey(userId));
  return raw.reduce((sum, q) => sum + Number(q), 0);
}
