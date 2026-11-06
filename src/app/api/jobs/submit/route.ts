import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { requireValidSession } from "@/lib/auth/rbac";
import { submitJobChecklistPayload } from "@/lib/jobs/submit-payload";
import { publicErrorMessage } from "@/lib/errors";

const schema = z.object({
  jobId: z.string().uuid(),
  idempotencyKey: z.string().min(8).max(128),
  items: z.array(
    z.object({
      itemId: z.string().uuid(),
      result: z.enum(["pass", "fail", "na", "exception"]),
      exceptionReason: z.string().max(500).optional(),
    }),
  ),
});

export async function POST(request: Request) {
  try {
    const session = await requireValidSession(await getSession());
    const payload = schema.parse(await request.json());
    await submitJobChecklistPayload(session, payload);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: publicErrorMessage(err) }, { status: 400 });
  }
}
