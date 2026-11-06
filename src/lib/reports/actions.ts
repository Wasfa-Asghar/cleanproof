"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { requireValidSession } from "@/lib/auth/rbac";
import { createReportShare, revokeReportShare } from "@/lib/reports/share-service";

export async function createReportShareAction(formData: FormData) {
  const session = await requireValidSession(await getSession());
  const jobId = String(formData.get("jobId"));
  const result = await createReportShare(session, {
    jobId,
    expiresInDays: Number(formData.get("expiresInDays") ?? 30),
  });
  revalidatePath("/app/reports");
  return result;
}

export async function revokeReportShareAction(shareId: string) {
  const session = await requireValidSession(await getSession());
  await revokeReportShare(session, shareId);
  revalidatePath("/app/reports");
}
