"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export type SettingsState = { ok?: boolean; message?: string; error?: string } | undefined;

export async function saveSettingsAction(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) redirect("/login?callbackUrl=/account");

  const name = String(formData.get("name") ?? "").trim();
  const newsletter = formData.get("newsletter") === "on";
  if (name.length < 2) return { error: "Name must be at least 2 characters." };
  if (name.length > 80) return { error: "Name must be 80 characters or fewer." };

  await db.user.update({ where: { id: userId }, data: { name, newsletter } });
  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved" };
}
