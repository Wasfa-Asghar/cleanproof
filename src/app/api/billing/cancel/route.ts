import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { cancelSubscription } from "@/lib/db/mutations";
import { getEnv } from "@/lib/env";
import { publicErrorMessage } from "@/lib/errors";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await cancelSubscription(session);
    const base = getEnv().APP_URL ?? "http://localhost:3000";
    return NextResponse.redirect(new URL("/app/settings/billing", base), 303);
  } catch (err) {
    return NextResponse.json({ error: publicErrorMessage(err) }, { status: 403 });
  }
}
