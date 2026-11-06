import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { evidence } from "@/db/schema";
import { getReportByToken } from "@/lib/db/queries";
import { getStorageAdapter } from "@/lib/storage";
import { ForbiddenError, NotFoundError } from "@/lib/errors";

export async function getPublicReportEvidence(token: string, evidenceId: string) {
  const report = await getReportByToken(token);
  if (!report?.job) throw new NotFoundError();

  const db = getDb();
  const [row] = await db
    .select()
    .from(evidence)
    .where(
      and(
        eq(evidence.id, evidenceId),
        eq(evidence.organizationId, report.org.id),
        eq(evidence.jobId, report.job.id),
        eq(evidence.scanState, "ready"),
        inArray(evidence.kind, ["before", "after"]),
      ),
    )
    .limit(1);
  if (!row) throw new NotFoundError();

  const storage = getStorageAdapter();
  const obj = await storage.getObject(row.objectKey);
  if (!obj) throw new NotFoundError();
  return { body: obj.body, mimeType: row.mimeType };
}

export async function listPublicReportEvidenceMeta(token: string) {
  const report = await getReportByToken(token);
  if (!report?.job) throw new ForbiddenError("Report unavailable");

  const db = getDb();
  return db
    .select({
      id: evidence.id,
      kind: evidence.kind,
      mimeType: evidence.mimeType,
      createdAt: evidence.createdAt,
    })
    .from(evidence)
    .where(
      and(
        eq(evidence.jobId, report.job.id),
        eq(evidence.organizationId, report.org.id),
        eq(evidence.scanState, "ready"),
        inArray(evidence.kind, ["before", "after"]),
      ),
    );
}
