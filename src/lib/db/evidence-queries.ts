import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { evidence } from "@/db/schema";

export async function listEvidenceForJob(jobId: string, organizationId: string) {
  const db = getDb();
  return db
    .select()
    .from(evidence)
    .where(and(eq(evidence.jobId, jobId), eq(evidence.organizationId, organizationId)))
    .orderBy(asc(evidence.createdAt));
}

export async function countReadyEvidenceForItem(jobId: string, itemId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(evidence)
    .where(
      and(eq(evidence.jobId, jobId), eq(evidence.itemId, itemId), eq(evidence.scanState, "ready")),
    );
  return rows.length;
}
