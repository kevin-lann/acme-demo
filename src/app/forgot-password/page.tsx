import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Reset password" };

async function requestReset(formData: FormData) {
  "use server";
  // Demo app: no email is actually sent. Always answer the same way to avoid account enumeration.
  void formData;
}

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-sm">
      <div className="card space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Reset your password</h1>
        <p className="text-sm text-zinc-500">
          Enter your email and, if an account exists, we&apos;ll send you a reset link.
        </p>
        <form action={requestReset} className="space-y-3">
          <label htmlFor="reset-email" className="label">
            Email
          </label>
          <input id="reset-email" name="email" type="email" required className="input" data-testid="reset-email" />
          <button type="submit" className="btn-primary w-full" data-testid="reset-submit">
            Send reset link
          </button>
        </form>
        <Link href="/login" className="text-sm text-brand-600 hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
