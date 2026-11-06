import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { completeMockCheckout } from "@/lib/billing/subscription-service";
import { isMockBillingAllowed } from "@/lib/billing/guards";
import { billingPublicMessage } from "@/lib/billing/errors";
import { getEnv } from "@/lib/env";

export async function POST(req: Request) {
  if (!isMockBillingAllowed()) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const form = await req.formData();
    const checkoutSessionRef = String(form.get("session") ?? "");
    const outcome = String(form.get("outcome") ?? "success") as "success" | "failure" | "canceled";
    if (!checkoutSessionRef) {
      return NextResponse.json({ error: "Missing session" }, { status: 400 });
    }

    await completeMockCheckout(session, checkoutSessionRef, outcome);
    const base = getEnv().APP_URL ?? "http://localhost:3000";
    return NextResponse.redirect(new URL("/app/settings/billing", base), 303);
  } catch (err) {
    return NextResponse.json({ error: billingPublicMessage(err) }, { status: 400 });
  }
}
