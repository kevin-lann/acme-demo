import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession, safeCallbackUrl } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  const target = safeCallbackUrl(callbackUrl);
  const session = await getSession();
  if (session?.user) redirect(target);

  return (
    <div className="mx-auto max-w-sm">
      <div className="card p-6">
        <h1 className="mb-1 text-2xl font-semibold">Sign in</h1>
        <p className="mb-6 text-sm text-zinc-500">Welcome back to Acme.</p>
        <LoginForm callbackUrl={target} />
      </div>
    </div>
  );
}
