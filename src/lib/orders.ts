import { db } from "./db";

export const ORDERS_PAGE_SIZE = 10;

export async function listOrders(userId: string, page: number) {
  const [total, orders] = await Promise.all([
    db.order.count({ where: { userId } }),
    db.order.findMany({
      where: { userId },
      orderBy: [{ createdAt: "desc" }, { number: "desc" }],
      skip: (page - 1) * ORDERS_PAGE_SIZE,
      take: ORDERS_PAGE_SIZE,
      include: { items: { include: { product: true } } },
    }),
  ]);
  return { orders, total, pageCount: Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE)) };
}

export type ShippingAddress = { name: string; line1: string; city: string; zip: string };

export async function createOrder(input: {
  userId: string;
  lines: { productId: string; quantity: number; priceCents: number }[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  promoCode: string | null;
  shipping: ShippingAddress;
  status: "paid" | "pending";
  stripeSession?: string;
}) {
  return db.$transaction(async (tx) => {
    const last = await tx.order.aggregate({ _max: { number: true } });
    return tx.order.create({
      data: {
        number: (last._max.number ?? 1000) + 1,
        userId: input.userId,
        status: input.status,
        subtotalCents: input.subtotalCents,
        discountCents: input.discountCents,
        totalCents: input.totalCents,
        promoCode: input.promoCode,
        shippingName: input.shipping.name,
        shippingLine1: input.shipping.line1,
        shippingCity: input.shipping.city,
        shippingZip: input.shipping.zip,
        stripeSession: input.stripeSession,
        items: { create: input.lines },
      },
    });
  });
}
