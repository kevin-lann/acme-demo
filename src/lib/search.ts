import type { Product } from "@prisma/client";
import { db } from "./db";

/**
 * Ranking: exact name > name prefix > word in name > tag > category > description,
 * then in-stock first, then popularity.
 */
export function scoreProduct(p: Product, query: string): number {
  const q = query.toLowerCase();
  const name = p.name.toLowerCase();
  let score = 0;
  if (name === q) score += 100;
  else if (name.startsWith(q)) score += 60;
  else if (name.split(/\s+/).some((w) => w.startsWith(q))) score += 40;
  else if (name.includes(q)) score += 30;
  if (p.tags.some((t) => t.toLowerCase() === q)) score += 25;
  else if (p.tags.some((t) => t.toLowerCase().includes(q))) score += 15;
  if (p.category.toLowerCase().includes(q)) score += 10;
  if (p.description.toLowerCase().includes(q)) score += 5;
  return score;
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim();
  if (!q) return [];
  const candidates = await db.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
      ],
    },
  });
  return candidates
    .map((p) => ({ p, score: scoreProduct(p, q) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || Number(b.p.inStock) - Number(a.p.inStock) || b.p.popularity - a.p.popularity)
    .map((r) => r.p);
}

export const SORTS = { relevance: "Best match", "price-asc": "Price: low to high", "price-desc": "Price: high to low" } as const;
export type SortKey = keyof typeof SORTS;

export function parseSort(value: string | undefined): SortKey {
  return value && value in SORTS ? (value as SortKey) : "relevance";
}

/** Re-orders ranked results; "relevance" keeps the ranking from searchProducts. */
export function sortProducts(products: Product[], sort: SortKey): Product[] {
  if (sort === "price-asc") return [...products].sort((a, b) => a.priceCents - b.priceCents);
  if (sort === "price-desc") return [...products].sort((a, b) => b.priceCents - a.priceCents);
  return products;
}
