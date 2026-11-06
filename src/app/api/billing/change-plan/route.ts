import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { schedulePlanChange } from "@/lib/billing/subscription-service";
import { isPlanId } from "@/lib/billing/plans";
import { billingPublicMessage } from "@/lib/billing/errors";
import { getEnv } from "@/lib/env";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const form = await req.formData();
    const planId = String(form.get("planId") ?? "");
    if (!isPlanId(planId)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    const result = await schedulePlanChange(session, planId);
    const base = getEnv().APP_URL ?? "http://localhost:3000";
    if ("checkoutUrl" in result && result.checkoutUrl) {
      return NextResponse.redirect(new URL(result.checkoutUrl, base), 303);
    }
    return NextResponse.redirect(new URL("/app/settings/billing", base), 303);
  } catch (err) {
    return NextResponse.json({ error: billingPublicMessage(err) }, { status: 400 });
  }
}
