import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth/session";
import { beginCheckout } from "@/lib/billing/subscription-service";
import { isPlanId } from "@/lib/billing/plans";
import { billingPublicMessage } from "@/lib/billing/errors";
import { getEnv } from "@/lib/env";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!checkRateLimit(rateLimitKey("billing-checkout", session.userId), 10, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const contentType = req.headers.get("content-type") ?? "";
    let planId = "starter";
    if (contentType.includes("application/json")) {
      const body = (await req.json()) as { planId?: string };
      planId = body.planId ?? planId;
    } else {
      const form = await req.formData();
      planId = String(form.get("planId") ?? planId);
    }
    if (!isPlanId(planId)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const { checkoutUrl } = await beginCheckout(session, planId, `checkout:${planId}:${randomUUID()}`);
    const base = getEnv().APP_URL ?? "http://localhost:3000";
    return NextResponse.redirect(new URL(checkoutUrl, base), 303);
  } catch (err) {
    return NextResponse.json({ error: billingPublicMessage(err) }, { status: 400 });
  }
}
