import { randomBytes } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { auditEvents, jobs, reportShares } from "@/db/schema";
import type { SessionPayload } from "@/lib/auth/session";
import { canReviewJobs } from "@/lib/constants/roles";
import { hashToken } from "@/lib/crypto/tokens";
import { ForbiddenError, NotFoundError } from "@/lib/errors";

export async function createReportShare(
  session: SessionPayload,
  input: { jobId: string; expiresInDays?: number },
) {
  if (!canReviewJobs(session.role)) throw new ForbiddenError();
  const db = getDb();
  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, input.jobId), eq(jobs.organizationId, session.organizationId)))
    .limit(1);
  if (!job) throw new NotFoundError();
  if (job.status !== "approved") {
    throw new ForbiddenError("Client reports can only be created for approved jobs");
  }

  const rawToken = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + (input.expiresInDays ?? 30) * 86400000);

  const [share] = await db
    .insert(reportShares)
    .values({
      organizationId: session.organizationId,
      jobId: input.jobId,
      tokenHash: hashToken(rawToken),
      expiresAt,
    })
    .returning();

  await db.insert(auditEvents).values({
    organizationId: session.organizationId,
    actorId: session.userId,
    action: "report_share.created",
    objectType: "report_share",
    objectId: share.id,
  });

  const { notifyReportPublished } = await import("@/lib/notifications/dispatch");
  void notifyReportPublished({
    organizationId: session.organizationId,
    jobId: input.jobId,
    jobTitle: job.title,
    idempotencyKey: `email:report:${share.id}`,
  });

  return { shareId: share.id, token: rawToken, expiresAt: expiresAt.toISOString() };
}

export async function revokeReportShare(session: SessionPayload, shareId: string) {
  if (!canReviewJobs(session.role)) throw new ForbiddenError();
  const db = getDb();
  const [updated] = await db
    .update(reportShares)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(reportShares.id, shareId),
        eq(reportShares.organizationId, session.organizationId),
        isNull(reportShares.revokedAt),
      ),
    )
    .returning();
  if (!updated) throw new NotFoundError();

  await db.insert(auditEvents).values({
    organizationId: session.organizationId,
    actorId: session.userId,
    action: "report_share.revoked",
    objectType: "report_share",
    objectId: shareId,
  });
}
