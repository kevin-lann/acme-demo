import { NewsletterModal } from "./newsletter-modal";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center">
        <div>
          <p className="font-semibold">Get 10% off your first order</p>
          <p className="text-sm text-zinc-500">New drops and deals, once a week. No spam.</p>
        </div>
        <NewsletterModal />
      </div>
      <p className="pb-6 text-center text-xs text-zinc-400">© Acme Store. A demo app for Interleave.</p>
    </footer>
  );
}
