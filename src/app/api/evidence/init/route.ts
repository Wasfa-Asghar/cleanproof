import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { requireValidSession } from "@/lib/auth/rbac";
import { initEvidenceUpload } from "@/lib/evidence/service";
import { publicErrorMessage } from "@/lib/errors";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";

const bodySchema = z.object({
  jobId: z.string().uuid(),
  itemId: z.string().uuid().optional(),
  kind: z.enum(["before", "after", "during"]).default("during"),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  sizeBytes: z.number().int().positive(),
  contentHash: z.string().min(8).max(128).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireValidSession(await getSession());
    if (!checkRateLimit(rateLimitKey("evidence-init", session.userId), 60, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    const json = bodySchema.parse(await request.json());
    const result = await initEvidenceUpload({ session, ...json });
    return NextResponse.json(result);
  } catch (err) {
    const status = err instanceof Error && err.message.includes("Forbidden") ? 403 : 400;
    return NextResponse.json({ error: publicErrorMessage(err) }, { status });
  }
}
