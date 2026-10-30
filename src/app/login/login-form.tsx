"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    if (!res || res.error) {
      setPending(false);
      setError("Invalid email or password.");
      return;
    }
    // Full navigation so every server component picks up the new session.
    window.location.assign(callbackUrl);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" data-testid="login-form">
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" data-testid="login-email" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="label">
            Password
          </label>
          <Link href="/forgot-password" className="mb-1 text-xs text-brand-600 hover:underline">
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="input"
          data-testid="login-password"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600" data-testid="login-error">
          {error}
        </p>
      )}
      <button type="submit" className="btn-primary w-full" disabled={pending} data-testid="login-submit">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
