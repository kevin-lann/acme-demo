import Link from "next/link";
import { getSession } from "@/lib/auth";
import { cartCount } from "@/lib/cart";
import { MobileMenu } from "./mobile-menu";
import { SignOutButton } from "./sign-out-button";
import { ThemeToggle } from "./theme-toggle";

export const NAV_LINKS = [
  { href: "/", label: "Shop" },
  { href: "/search", label: "Search" },
  { href: "/orders", label: "Orders" },
  { href: "/account", label: "Account" },
];

export async function Header() {
  const session = await getSession();
  const userId = session?.user?.id;
  const count = userId ? await cartCount(userId) : 0;

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <MobileMenu links={NAV_LINKS} signedIn={Boolean(userId)} />
        <Link href="/" className="text-lg font-bold tracking-tight" data-testid="logo">
          acme<span className="text-brand-600">.</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              data-testid={`nav-${l.label.toLowerCase()}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <form action="/search" className="ml-auto hidden flex-1 justify-end sm:flex" role="search">
          <input
            name="q"
            type="search"
            placeholder="Search products"
            aria-label="Search products"
            className="input max-w-xs"
            data-testid="header-search-input"
          />
        </form>
        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <ThemeToggle />
          <Link
            href="/cart"
            className="btn-secondary relative"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
            data-testid="cart-link"
          >
            Cart
            <span
              className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white"
              data-testid="cart-count"
            >
              {count}
            </span>
          </Link>
          {userId ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-sm text-zinc-500" data-testid="header-user">
                {session?.user?.name}
              </span>
              <SignOutButton />
            </div>
          ) : (
            <Link href="/login" className="btn-primary hidden md:inline-flex" data-testid="header-sign-in">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
