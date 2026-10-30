import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/money";
import { listOrders } from "@/lib/orders";

export const metadata: Metadata = { title: "Order history" };

type Props = { searchParams: Promise<{ page?: string }> };

export default async function OrdersPage({ searchParams }: Props) {
  const user = await requireUser("/orders");
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const { orders, total, pageCount } = await listOrders(user.id, page);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-semibold">Order history</h1>
        <p className="text-sm text-zinc-500" data-testid="orders-total">
          {total} order{total === 1 ? "" : "s"}
        </p>
      </div>
      {orders.length === 0 ? (
        <div className="card p-8 text-center text-zinc-500" data-testid="orders-empty">
          No orders on this page.
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm" data-testid="orders-table">
            <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {orders.map((o) => (
                <tr key={o.id} data-testid="order-row" data-order-number={o.number}>
                  <td className="px-4 py-3 font-mono">#{o.number}</td>
                  <td className="px-4 py-3">{o.createdAt.toLocaleDateString("en-US", { dateStyle: "medium" })}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {o.items.map((i) => `${i.product.name}${i.quantity > 1 ? ` × ${i.quantity}` : ""}`).join(", ")}
                  </td>
                  <td className="px-4 py-3 capitalize">{o.status}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatPrice(o.totalCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <nav className="flex items-center justify-between" aria-label="Pagination" data-testid="orders-pagination">
        {page > 1 ? (
          <Link href={`/orders?page=${page - 1}`} className="btn-secondary" rel="prev" data-testid="orders-prev">
            ← Previous
          </Link>
        ) : (
          <span />
        )}
        <span className="text-sm text-zinc-500" data-testid="orders-page-indicator">
          Page {page} of {pageCount}
        </span>
        {page < pageCount ? (
          <Link href={`/orders?page=${page + 1}`} className="btn-secondary" rel="next" data-testid="orders-next">
            Next →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
