import type { Product } from "@prisma/client";
import Link from "next/link";
import { formatPrice } from "@/lib/money";

export function ProductCard({ product, rank }: { product: Product; rank?: number }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="card group block overflow-hidden transition hover:shadow-md"
      data-testid="product-card"
      data-product-slug={product.slug}
      data-rank={rank}
    >
      {/* biome-ignore lint/performance/noImgElement: generated SVG */}
      <img src={`/img/${product.slug}/0`} alt="" className="aspect-square w-full object-cover" loading="lazy" />
      <div className="space-y-1 p-4">
        <p className="text-xs uppercase tracking-wide text-zinc-500">{product.category}</p>
        <h3 className="font-medium group-hover:text-brand-600" data-testid="product-name">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="font-semibold">{formatPrice(product.priceCents)}</span>
          {!product.inStock && <span className="text-xs text-amber-600">Out of stock</span>}
        </div>
      </div>
    </Link>
  );
}
