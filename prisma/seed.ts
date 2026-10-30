/**
 * Seeds a known catalog, two test users and a deterministic order history.
 * Safe to re-run: wipes app tables first. Test login: ada@acme.test / acme-demo-123
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

export const TEST_USER = { email: "ada@acme.test", password: "acme-demo-123", name: "Ada Lovelace" };
const SECOND_USER = { email: "grace@acme.test", password: "acme-demo-123", name: "Grace Hopper" };

const PRODUCTS: {
  name: string;
  category: string;
  priceCents: number;
  tags: string[];
  popularity: number;
  inStock?: boolean;
  description: string;
}[] = [
  { name: "Wireless Headphones", category: "Audio", priceCents: 12900, tags: ["audio", "headphones", "bluetooth"], popularity: 98, description: "Over-ear wireless headphones with 30-hour battery and active noise cancelling." },
  { name: "Studio Headphones", category: "Audio", priceCents: 8900, tags: ["audio", "headphones", "wired"], popularity: 61, description: "Closed-back wired headphones tuned for mixing and long listening sessions." },
  { name: "Wireless Earbuds", category: "Audio", priceCents: 7900, tags: ["audio", "earbuds", "bluetooth"], popularity: 90, description: "Pocket-sized earbuds with a charging case and sweat resistance." },
  { name: "Headphone Stand", category: "Desk", priceCents: 2900, tags: ["desk", "headphones", "accessory"], popularity: 35, description: "Weighted aluminium stand that keeps your headphones off the desk." },
  { name: "Bluetooth Speaker", category: "Audio", priceCents: 5900, tags: ["audio", "speaker", "bluetooth"], popularity: 72, description: "Waterproof speaker with 12 hours of playtime and a carry loop." },
  { name: "Commuter Backpack", category: "Bags", priceCents: 11900, tags: ["bag", "backpack", "laptop"], popularity: 85, description: "Water-resistant 20L backpack with a padded 16-inch laptop sleeve." },
  { name: "Weekender Duffel", category: "Bags", priceCents: 14900, tags: ["bag", "travel"], popularity: 40, description: "Canvas duffel with leather handles and a separate shoe compartment." },
  { name: "Laptop Sleeve", category: "Bags", priceCents: 3900, tags: ["bag", "laptop", "accessory"], popularity: 55, description: "Felt sleeve that fits most 13 to 14-inch laptops." },
  { name: "Standing Desk", category: "Desk", priceCents: 49900, tags: ["desk", "furniture", "ergonomic"], popularity: 77, description: "Dual-motor standing desk with four height presets." },
  { name: "Desk Lamp", category: "Desk", priceCents: 6900, tags: ["desk", "lighting"], popularity: 58, description: "Dimmable LED lamp with adjustable colour temperature and USB-C charging." },
  { name: "Ergonomic Chair", category: "Desk", priceCents: 34900, tags: ["desk", "furniture", "ergonomic"], popularity: 81, description: "Mesh office chair with adjustable lumbar support and 4D arms." },
  { name: "Mechanical Keyboard", category: "Desk", priceCents: 11900, tags: ["desk", "keyboard"], popularity: 88, description: "Hot-swappable 75% keyboard with tactile switches." },
  { name: "Wireless Mouse", category: "Desk", priceCents: 4900, tags: ["desk", "mouse", "bluetooth"], popularity: 70, description: "Silent-click mouse that pairs with three devices." },
  { name: "Monitor Arm", category: "Desk", priceCents: 8900, tags: ["desk", "ergonomic"], popularity: 30, description: "Gas-spring arm for monitors up to 32 inches." },
  { name: "USB-C Hub", category: "Tech", priceCents: 5900, tags: ["tech", "usb", "accessory"], popularity: 66, description: "7-in-1 hub with HDMI, SD card reader and 100W pass-through charging." },
  { name: "Portable Charger", category: "Tech", priceCents: 4500, tags: ["tech", "battery"], popularity: 74, description: "10,000 mAh power bank with fast charging." },
  { name: "Smart Water Bottle", category: "Outdoor", priceCents: 3900, tags: ["outdoor", "bottle"], popularity: 25, description: "Insulated bottle that reminds you to drink water." },
  { name: "Trail Running Shoes", category: "Outdoor", priceCents: 13900, tags: ["outdoor", "shoes", "running"], popularity: 63, description: "Lightweight trail shoes with a grippy outsole." },
  { name: "Rain Jacket", category: "Outdoor", priceCents: 15900, tags: ["outdoor", "jacket"], popularity: 47, description: "Packable waterproof shell with taped seams." },
  { name: "Insulated Mug", category: "Kitchen", priceCents: 2900, tags: ["kitchen", "mug"], popularity: 52, description: "Keeps coffee hot for 3 hours, fits most cup holders." },
  { name: "Pour-Over Coffee Kit", category: "Kitchen", priceCents: 6400, tags: ["kitchen", "coffee"], popularity: 44, description: "Dripper, filters and a gooseneck kettle in one box." },
  { name: "Noise Machine", category: "Home", priceCents: 4900, tags: ["home", "audio", "sleep"], popularity: 20, inStock: false, description: "White noise machine with 20 sounds and a sleep timer." },
  { name: "Linen Throw Blanket", category: "Home", priceCents: 7900, tags: ["home", "blanket"], popularity: 33, description: "Stonewashed linen throw, soft from the first use." },
  { name: "Plant Pot Set", category: "Home", priceCents: 3400, tags: ["home", "plants"], popularity: 28, description: "Three ceramic pots with drainage trays." },
];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const STREETS = ["1 Infinite Loop", "221B Baker St", "742 Evergreen Terrace", "12 Grimmauld Pl", "4 Privet Dr"];

async function main() {
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.product.deleteMany();
  await db.user.deleteMany();
  await db.newsletterSubscriber.deleteMany();

  const products = [];
  for (const p of PRODUCTS) {
    products.push(
      await db.product.create({
        data: {
          slug: slugify(p.name),
          name: p.name,
          description: p.description,
          category: p.category,
          tags: p.tags,
          priceCents: p.priceCents,
          popularity: p.popularity,
          inStock: p.inStock ?? true,
          imageCount: 3 + (p.popularity % 2),
        },
      }),
    );
  }

  const [ada, grace] = await Promise.all(
    [TEST_USER, SECOND_USER].map(async (u) =>
      db.user.create({ data: { email: u.email, name: u.name, passwordHash: await bcrypt.hash(u.password, 10) } }),
    ),
  );

  // 35 orders for Ada (4 pages of 10), one per day, numbered from #1001 (oldest) to #1038 (newest).
  // Grace gets 3 orders interleaved so per-user filtering is exercised.
  const start = new Date("2026-06-01T15:00:00Z").getTime();
  const DAY = 24 * 60 * 60 * 1000;
  let number = 1001;
  for (let i = 0; i < 38; i++) {
    const isGrace = i % 13 === 6;
    const user = isGrace ? grace : ada;
    const a = products[(i * 7) % products.length];
    const b = products[(i * 11 + 3) % products.length];
    const items = i % 3 === 0 ? [{ p: a, q: 1 }, { p: b, q: 2 }] : [{ p: a, q: 1 + (i % 2) }];
    const subtotal = items.reduce((s, it) => s + it.p.priceCents * it.q, 0);
    const promo = i % 5 === 0 ? "SAVE10" : null;
    const discount = promo ? Math.round(subtotal / 10) : 0;
    await db.order.create({
      data: {
        number: number++,
        userId: user.id,
        status: "paid",
        subtotalCents: subtotal,
        discountCents: discount,
        totalCents: subtotal - discount,
        promoCode: promo,
        shippingName: user.name,
        shippingLine1: STREETS[i % STREETS.length],
        shippingCity: "Springfield",
        shippingZip: String(10000 + i * 37),
        createdAt: new Date(start + i * DAY),
        items: { create: items.map((it) => ({ productId: it.p.id, quantity: it.q, priceCents: it.p.priceCents })) },
      },
    });
  }

  const adaOrders = await db.order.count({ where: { userId: ada.id } });
  console.log(`Seeded ${products.length} products, 2 users, ${adaOrders} orders for ${TEST_USER.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
