"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import * as cart from "@/lib/cart";
import { db } from "@/lib/db";

async function userIdOrLogin(callbackUrl: string): Promise<string> {
  const session = await getSession();
  const id = session?.user?.id;
  if (!id) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return id;
}

export type ActionState = { ok?: boolean; message?: string; error?: string } | undefined;

export async function addToCartAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const productId = String(formData.get("productId"));
  const returnTo = String(formData.get("returnTo") ?? "/");
  const userId = await userIdOrLogin(returnTo);
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return { error: "That product no longer exists." };
  if (!product.inStock) return { error: `${product.name} is out of stock.` };
  await cart.addToCart(userId, productId, 1);
  revalidatePath("/", "layout");
  return { ok: true, message: `${product.name} added to cart` };
}

export async function updateQuantityAction(formData: FormData) {
  const userId = await userIdOrLogin("/cart");
  const productId = String(formData.get("productId"));
  const quantity = Number(formData.get("quantity"));
  if (!Number.isFinite(quantity)) return;
  await cart.setQuantity(userId, productId, Math.floor(quantity));
  revalidatePath("/", "layout");
}

export async function removeItemAction(formData: FormData) {
  const userId = await userIdOrLogin("/cart");
  await cart.setQuantity(userId, String(formData.get("productId")), 0);
  revalidatePath("/", "layout");
}

export async function applyPromoAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await userIdOrLogin("/cart");
  const code = String(formData.get("code") ?? "");
  if (!code.trim()) return { error: "Enter a promo code." };
  const ok = await cart.applyPromo(userId, code);
  if (!ok) return { error: `"${code.trim()}" is not a valid promo code.` };
  revalidatePath("/cart");
  return { ok: true };
}

export async function removePromoAction() {
  const userId = await userIdOrLogin("/cart");
  await cart.removePromo(userId);
  revalidatePath("/cart");
}
