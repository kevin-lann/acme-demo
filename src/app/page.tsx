import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await db.product.findMany({ orderBy: { popularity: "desc" }, take: 8 });
  return (
    <div className="space-y-10">
      <section className="card flex flex-col items-start gap-4 bg-gradient-to-br from-brand-50 to-white p-8 dark:from-zinc-900 dark:to-zinc-900">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Everyday gear, delivered.</h1>
        <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
          Headphones, bags, desk setups and more. Free shipping over $50. Use code <strong>SAVE10</strong> for 10%
          off.
        </p>
        <Link href="/search" className="btn-primary" data-testid="hero-shop">
          Browse products
        </Link>
      </section>
      <section>
        <h2 className="mb-4 text-xl font-semibold">Popular right now</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4" data-testid="popular-products">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
