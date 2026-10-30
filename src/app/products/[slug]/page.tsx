import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { Gallery } from "./gallery";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) notFound();

  const images = Array.from({ length: product.imageCount }, (_, i) => ({
    src: `/img/${product.slug}/${i}`,
    alt: `${product.name}, image ${i + 1} of ${product.imageCount}`,
  }));

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Gallery images={images} />
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-wide text-zinc-500">{product.category}</p>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="product-title">
          {product.name}
        </h1>
        <p className="text-2xl font-semibold" data-testid="product-price">
          {formatPrice(product.priceCents)}
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">{product.description}</p>
        <p className={product.inStock ? "text-sm text-green-700" : "text-sm text-amber-600"} data-testid="stock-status">
          {product.inStock ? "In stock, ships in 1–2 days" : "Out of stock"}
        </p>
        <AddToCartButton productId={product.id} returnTo={`/products/${product.slug}`} disabled={!product.inStock} />
        <ul className="flex flex-wrap gap-2 pt-2">
          {product.tags.map((t) => (
            <li key={t} className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
