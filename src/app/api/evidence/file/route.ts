import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { requireValidSession } from "@/lib/auth/rbac";
import { getEvidenceFileByObjectKey, getEvidenceFileForSession } from "@/lib/evidence/service";

export async function GET(request: Request) {
  const session = await requireValidSession(await getSession());
  const url = new URL(request.url);
  const evidenceId = url.searchParams.get("id");
  const key = url.searchParams.get("key");

  try {
    const file = evidenceId
      ? await getEvidenceFileForSession(session, evidenceId)
      : key
        ? await getEvidenceFileByObjectKey(session, key)
        : null;
    if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return new NextResponse(new Uint8Array(file.body), {
      headers: {
        "Content-Type": file.mimeType,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
