"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SignOutButton } from "./sign-out-button";

type NavLink = { href: string; label: string };

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileMenu({ links, signedIn }: { links: NavLink[]; signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: close on navigation
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    drawer?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !drawer) return;
      // Keep focus inside the drawer while it is open.
      const items = Array.from(drawer.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        className="btn-secondary px-3"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
        data-testid="mobile-menu-button"
      >
        <span aria-hidden="true">☰</span>
      </button>
      {/* Portal: the sticky header's backdrop-filter would otherwise trap `position: fixed`. */}
      {open &&
        createPortal(
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div
            ref={drawerRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 left-0 flex w-72 flex-col gap-1 bg-white p-4 shadow-xl dark:bg-zinc-900"
            data-testid="mobile-menu"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-bold">acme.</span>
              <button
                type="button"
                className="btn-secondary px-3"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                data-testid="mobile-menu-close"
              >
                ✕
              </button>
            </div>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                data-testid={`mobile-nav-${l.label.toLowerCase()}`}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/cart" className="rounded-md px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Cart
            </Link>
            <div className="mt-auto">
              {signedIn ? (
                <SignOutButton className="btn-secondary w-full" />
              ) : (
                <Link href="/login" className="btn-primary w-full">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>,
          document.body,
        )}
    </div>
  );
}
