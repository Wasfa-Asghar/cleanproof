import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { processBillingCycle } from "@/lib/billing/scheduler";
import { retryFailedEmails } from "@/lib/notifications/service";

function authorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return false;
  const header = request.headers.get("authorization") ?? "";
  const given = Buffer.from(header.replace(/^Bearer\s+/i, ""));
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Daily housekeeping: trial expiry and reminders, scheduled plan changes, overdue subscriptions, and failed email retries.
 * Call it once a day from your host's scheduler with `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(request: Request) {
  if (!authorised(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const billing = await processBillingCycle();
  await retryFailedEmails();
  return NextResponse.json({ ok: true, billing });
}

export const POST = GET;
