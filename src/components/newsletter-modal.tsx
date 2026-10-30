"use client";

import { useEffect, useRef, useState } from "react";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done"; message: string } | { kind: "error"; message: string };

export function NewsletterModal() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    setStatus({ kind: "sending" });
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const body = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
    if (res.ok) setStatus({ kind: "done", message: body.message ?? "Thanks for subscribing!" });
    else setStatus({ kind: "error", message: body.error ?? "Something went wrong. Try again." });
  }

  return (
    <>
      <button
        type="button"
        className="btn-primary"
        onClick={() => {
          setStatus({ kind: "idle" });
          setOpen(true);
        }}
        data-testid="newsletter-open"
      >
        Subscribe to newsletter
      </button>
      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        aria-labelledby="newsletter-title"
        className="m-auto w-full max-w-md rounded-xl bg-white p-6 text-zinc-900 shadow-2xl backdrop:bg-black/50 dark:bg-zinc-900 dark:text-zinc-100"
        data-testid="newsletter-modal"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="newsletter-title" className="text-xl font-semibold">
            Join the Acme newsletter
          </h2>
          <button
            type="button"
            aria-label="Close"
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            onClick={() => setOpen(false)}
            data-testid="newsletter-close"
          >
            ✕
          </button>
        </div>
        {status.kind === "done" ? (
          <div className="space-y-4">
            <p role="status" className="text-green-700 dark:text-green-400" data-testid="newsletter-success">
              {status.message}
            </p>
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3" noValidate>
            <p className="text-sm text-zinc-500">Weekly deals and new arrivals. Unsubscribe any time.</p>
            <label htmlFor="newsletter-email" className="label">
              Email
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="input"
              placeholder="you@example.com"
              data-testid="newsletter-email"
            />
            {status.kind === "error" && (
              <p role="alert" className="text-sm text-red-600" data-testid="newsletter-error">
                {status.message}
              </p>
            )}
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={status.kind === "sending"}
              data-testid="newsletter-submit"
            >
              {status.kind === "sending" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        )}
      </dialog>
    </>
  );
}
