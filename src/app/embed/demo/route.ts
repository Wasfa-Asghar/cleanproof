import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { getDemoUserByRole, getMembershipForUser } from "@/lib/db/queries";
import { isDemoModeEnabled } from "@/lib/env";

/** Sets a demo owner session, then sends the iframe into the live app. */
export async function GET(request: Request) {
  const url = new URL(request.url);

  if (!isDemoModeEnabled()) {
    return NextResponse.redirect(new URL("/demo", url.origin));
  }

  const user = await getDemoUserByRole("owner");
  if (!user) {
    return NextResponse.redirect(new URL("/auth/login?error=demo", url.origin));
  }
  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    return NextResponse.redirect(new URL("/auth/login?error=demo", url.origin));
  }

  await createSession({
    userId: user.id,
    organizationId: membership.organizationId,
    role: membership.role,
  });

  return NextResponse.redirect(new URL("/app/overview", url.origin));
}
