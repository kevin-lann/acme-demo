"use client";

import { useActionState } from "react";
import { saveSettingsAction } from "./actions";

export function SettingsForm({ name, email, newsletter }: { name: string; email: string; newsletter: boolean }) {
  const [state, action, pending] = useActionState(saveSettingsAction, undefined);
  return (
    <form action={action} className="card space-y-4 p-6" data-testid="settings-form">
      <div>
        <label htmlFor="settings-name" className="label">
          Display name
        </label>
        <input id="settings-name" name="name" defaultValue={name} className="input" data-testid="settings-name" />
      </div>
      <div>
        <label htmlFor="settings-email" className="label">
          Email
        </label>
        <input id="settings-email" value={email} readOnly disabled className="input opacity-70" />
        <p className="mt-1 text-xs text-zinc-500">Contact support to change your sign-in email.</p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="newsletter"
          defaultChecked={newsletter}
          className="h-4 w-4 accent-brand-600"
          data-testid="settings-newsletter"
        />
        Email me weekly deals and new arrivals
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary" disabled={pending} data-testid="settings-save">
          {pending ? "Saving…" : "Save changes"}
        </button>
        {state?.message && (
          <p role="status" className="text-sm text-green-700 dark:text-green-400" data-testid="settings-saved">
            {state.message}
          </p>
        )}
        {state?.error && (
          <p role="alert" className="text-sm text-red-600" data-testid="settings-error">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
