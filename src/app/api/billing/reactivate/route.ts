import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { reactivateSubscription } from "@/lib/billing/subscription-service";
import { billingPublicMessage } from "@/lib/billing/errors";
import { getEnv } from "@/lib/env";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await reactivateSubscription(session);
    const base = getEnv().APP_URL ?? "http://localhost:3000";
    return NextResponse.redirect(new URL("/app/settings/billing", base), 303);
  } catch (err) {
    return NextResponse.json({ error: billingPublicMessage(err) }, { status: 403 });
  }
}
