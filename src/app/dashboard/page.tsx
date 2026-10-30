import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const [recent, orderCount, cart] = await Promise.all([
    db.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 3 }),
    db.order.count({ where: { userId: user.id } }),
    getCart(user.id),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="dashboard-heading">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="text-zinc-500">Signed in as {user.email}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/orders" className="card p-5 hover:shadow-md" data-testid="dashboard-orders">
          <p className="text-sm text-zinc-500">Orders</p>
          <p className="text-2xl font-semibold">{orderCount}</p>
        </Link>
        <Link href="/cart" className="card p-5 hover:shadow-md" data-testid="dashboard-cart">
          <p className="text-sm text-zinc-500">In your cart</p>
          <p className="text-2xl font-semibold">
            {cart.itemCount} item{cart.itemCount === 1 ? "" : "s"}
          </p>
        </Link>
        <Link href="/account" className="card p-5 hover:shadow-md" data-testid="dashboard-account">
          <p className="text-sm text-zinc-500">Account</p>
          <p className="text-2xl font-semibold">Settings</p>
        </Link>
      </div>
      <section className="card p-5">
        <h2 className="mb-3 font-semibold">Recent orders</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-zinc-500">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {recent.map((o) => (
              <li key={o.id} className="flex justify-between py-2 text-sm">
                <span className="font-mono">#{o.number}</span>
                <span>{o.createdAt.toLocaleDateString("en-US", { dateStyle: "medium" })}</span>
                <span className="font-medium">{formatPrice(o.totalCents)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
