import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Account settings" };

export default async function AccountPage() {
  const { id } = await requireUser("/account");
  const user = await db.user.findUniqueOrThrow({ where: { id } });
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Account settings</h1>
      <SettingsForm name={user.name} email={user.email} newsletter={user.newsletter} />
    </div>
  );
}
