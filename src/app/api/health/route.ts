import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {};
  try {
    await db.$queryRaw`SELECT 1`;
    checks.postgres = "ok";
  } catch (e) {
    checks.postgres = `error: ${(e as Error).message.split("\n")[0]}`;
  }
  try {
    checks.redis = (await redis.ping()) === "PONG" ? "ok" : "error";
  } catch (e) {
    checks.redis = `error: ${(e as Error).message}`;
  }
  const ok = Object.values(checks).every((v) => v === "ok");
  return NextResponse.json({ status: ok ? "ok" : "degraded", checks }, { status: ok ? 200 : 503 });
}
