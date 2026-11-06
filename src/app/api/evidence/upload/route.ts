import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { requireValidSession } from "@/lib/auth/rbac";
import { completeEvidenceUpload } from "@/lib/evidence/service";
import { publicErrorMessage } from "@/lib/errors";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const session = await requireValidSession(await getSession());
    if (!checkRateLimit(rateLimitKey("evidence-upload", session.userId), 30, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    const url = new URL(request.url);
    const evidenceId = url.searchParams.get("evidenceId");
    if (!evidenceId) {
      return NextResponse.json({ error: "evidenceId required" }, { status: 400 });
    }
    const body = Buffer.from(await request.arrayBuffer());
    const result = await completeEvidenceUpload({ session, evidenceId, body });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: publicErrorMessage(err) }, { status: 400 });
  }
}
