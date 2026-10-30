import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { db } from "@/lib/db";
import { searchProducts } from "@/lib/search";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query ? await searchProducts(query) : await db.product.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <form action="/search" role="search" className="flex gap-2">
        <input
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Search for headphones, backpacks, desks…"
          aria-label="Search products"
          className="input"
          data-testid="search-input"
        />
        <button type="submit" className="btn-primary" data-testid="search-submit">
          Search
        </button>
      </form>

      {query && (
        <p className="text-sm text-zinc-500" data-testid="search-summary">
          {results.length} result{results.length === 1 ? "" : "s"} for “{query}”
        </p>
      )}

      {query && results.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center" data-testid="search-empty">
          <h2 className="text-lg font-semibold">No products match “{query}”</h2>
          <p className="max-w-md text-sm text-zinc-500">
            Check the spelling or try a broader term like “audio”, “bag” or “desk”.
          </p>
          <Link href="/search" className="btn-secondary">
            Browse all products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4" data-testid="search-results">
          {results.map((p, i) => (
            <ProductCard key={p.id} product={p} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
