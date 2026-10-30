"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({ className = "btn-secondary" }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => signOut({ callbackUrl: "/" })} data-testid="sign-out">
      Sign out
    </button>
  );
}
