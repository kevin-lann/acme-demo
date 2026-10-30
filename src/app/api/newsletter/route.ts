import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  const existing = await db.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ message: "You're already subscribed. Thanks!" });
  await db.newsletterSubscriber.create({ data: { email } });
  return NextResponse.json({ message: "Thanks for subscribing! Check your inbox for 10% off." });
}
