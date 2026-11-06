import { and, asc, eq, inArray, notInArray } from "drizzle-orm";
import { getDb } from "@/db";
import { auditEvents, jobItemResults, jobs, reviews } from "@/db/schema";
import type { SessionPayload } from "@/lib/auth/session";
import { canReviewJobs } from "@/lib/constants/roles";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { createRecleanJobForSource } from "@/lib/quality/reclean-service";
import { resolveIssueForApprovedReclean } from "@/lib/issues/service";
import { recordAudit } from "@/lib/db/audit";
import { getJobForOrganization } from "@/lib/db/queries";

export type ReviewVerdict = "approved" | "clarification" | "rejected";

function assertReviewer(session: SessionPayload) {
  if (!canReviewJobs(session.role)) throw new ForbiddenError("Not allowed to review jobs");
}

async function loadReviewableJob(jobId: string, session: SessionPayload) {
  const job = await getJobForOrganization(jobId, session.organizationId);
  if (!job) throw new NotFoundError();
  if (job.status !== "needs_review" && job.status !== "submitted") {
    throw new ForbiddenError(`Job is not awaiting review (status=${job.status})`);
  }
  if (job.assignedUserId === session.userId) {
    throw new ForbiddenError("You cannot review your own work");
  }
  return job;
}

async function findIdempotentReview(jobId: string, idempotencyKey: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.jobId, jobId), eq(reviews.idempotencyKey, idempotencyKey)))
    .limit(1);
  return row;
}

export async function approveJobReview(
  session: SessionPayload,
  input: { jobId: string; idempotencyKey: string; internalNotes?: string },
) {
  assertReviewer(session);

  const existing = await findIdempotentReview(input.jobId, input.idempotencyKey);
  if (existing) return { duplicate: true as const, reviewId: existing.id };

  await loadReviewableJob(input.jobId, session);

  const db = getDb();
  let approvedRecleanId: string | undefined;
  await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(jobs)
      .set({ status: "approved" })
      .where(and(eq(jobs.id, input.jobId), eq(jobs.organizationId, session.organizationId)))
      .returning();
    if (!updated) throw new NotFoundError();

    await tx.insert(reviews).values({
      organizationId: session.organizationId,
      jobId: input.jobId,
      reviewerId: session.userId,
      verdict: "approved",
      internalNotes: input.internalNotes ?? null,
      idempotencyKey: input.idempotencyKey,
    });

    await tx.insert(auditEvents).values({
      organizationId: session.organizationId,
      actorId: session.userId,
      action: "job.approved",
      objectType: "job",
      objectId: input.jobId,
      payload: input.internalNotes ? { internalNotes: input.internalNotes } : undefined,
    });

    if (updated.jobKind === "reclean") approvedRecleanId = updated.id;
  });

  if (approvedRecleanId) {
    await resolveIssueForApprovedReclean(approvedRecleanId, session.organizationId, session.userId);
  }

  const job = await getJobForOrganization(input.jobId, session.organizationId);
  if (job) {
    const { notifyJobApproved } = await import("@/lib/notifications/dispatch");
    void notifyJobApproved({
      organizationId: session.organizationId,
      jobId: input.jobId,
      jobTitle: job.title,
      assigneeUserId: job.assignedUserId,
      idempotencyKey: `email:${input.idempotencyKey}`,
    });
  }

  return { duplicate: false as const };
}

export async function requestClarificationReview(
  session: SessionPayload,
  input: { jobId: string; idempotencyKey: string; reason: string; internalNotes?: string },
) {
  assertReviewer(session);
  if (!input.reason.trim()) throw new ForbiddenError("Clarification reason is required");

  const existing = await findIdempotentReview(input.jobId, input.idempotencyKey);
  if (existing) return { duplicate: true as const };

  await loadReviewableJob(input.jobId, session);

  const db = getDb();
  await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(jobs)
      .set({ status: "in_progress" })
      .where(and(eq(jobs.id, input.jobId), eq(jobs.organizationId, session.organizationId)))
      .returning();
    if (!updated) throw new NotFoundError();

    await tx.insert(reviews).values({
      organizationId: session.organizationId,
      jobId: input.jobId,
      reviewerId: session.userId,
      verdict: "clarification",
      notes: input.reason,
      internalNotes: input.internalNotes ?? null,
      idempotencyKey: input.idempotencyKey,
    });

    await tx.insert(auditEvents).values({
      organizationId: session.organizationId,
      actorId: session.userId,
      action: "job.clarification_requested",
      objectType: "job",
      objectId: input.jobId,
      payload: { reason: input.reason },
    });
  });

  const job = await getJobForOrganization(input.jobId, session.organizationId);
  if (job?.assignedUserId) {
    const { notifyClarification } = await import("@/lib/notifications/dispatch");
    void notifyClarification({
      organizationId: session.organizationId,
      jobId: input.jobId,
      jobTitle: job.title,
      assigneeUserId: job.assignedUserId,
      reason: input.reason,
      idempotencyKey: `email:${input.idempotencyKey}`,
    });
  }

  return { duplicate: false as const };
}

export async function rejectJobReview(
  session: SessionPayload,
  input: {
    jobId: string;
    idempotencyKey: string;
    reason: string;
    assigneeId: string;
    internalNotes?: string;
  },
) {
  assertReviewer(session);
  if (!input.reason.trim()) throw new ForbiddenError("Rejection reason is required");

  const existing = await findIdempotentReview(input.jobId, input.idempotencyKey);
  if (existing) {
    const db = getDb();
    const [reclean] = await db
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.recleanSourceJobId, input.jobId),
          eq(jobs.organizationId, session.organizationId),
          notInArray(jobs.status, ["approved", "closed", "cancelled"]),
        ),
      )
      .limit(1);
    return { duplicate: true as const, recleanJobId: reclean?.id };
  }

  await loadReviewableJob(input.jobId, session);

  const db = getDb();
  const failedItems = await db
    .select({ itemId: jobItemResults.itemId })
    .from(jobItemResults)
    .where(
      and(
        eq(jobItemResults.jobId, input.jobId),
        inArray(jobItemResults.result, ["fail", "exception"]),
      ),
    );

  const { assertBillableAction } = await import("@/lib/billing/entitlements");
  await assertBillableAction(session.organizationId, "create_job");

  let recleanJobId: string | undefined;
  await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(jobs)
      .set({
        status: "rejected",
        failedItemIds: failedItems.map((f) => f.itemId),
      })
      .where(and(eq(jobs.id, input.jobId), eq(jobs.organizationId, session.organizationId)))
      .returning();
    if (!updated) throw new NotFoundError();

    await tx.insert(reviews).values({
      organizationId: session.organizationId,
      jobId: input.jobId,
      reviewerId: session.userId,
      verdict: "rejected",
      notes: input.reason,
      internalNotes: input.internalNotes ?? null,
      idempotencyKey: input.idempotencyKey,
    });

    recleanJobId = await createRecleanJobForSource(tx, {
      session,
      sourceJob: updated,
      assigneeId: input.assigneeId,
      reason: input.reason,
      failedItemIds: failedItems.map((f) => f.itemId),
    });

    await tx.insert(auditEvents).values({
      organizationId: session.organizationId,
      actorId: session.userId,
      action: "job.rejected",
      objectType: "job",
      objectId: input.jobId,
      payload: { reason: input.reason, recleanJobId },
    });
  });

  const job = await getJobForOrganization(input.jobId, session.organizationId);
  if (job) {
    const { notifyJobRejected, notifyRecleanAssigned } = await import("@/lib/notifications/dispatch");
    void notifyJobRejected({
      organizationId: session.organizationId,
      jobId: input.jobId,
      jobTitle: job.title,
      assigneeUserId: input.assigneeId,
      reason: input.reason,
      idempotencyKey: `email:reject:${input.idempotencyKey}`,
    });
    if (recleanJobId) {
      void notifyRecleanAssigned({
        organizationId: session.organizationId,
        recleanJobId,
        jobTitle: `Re-clean: ${job.title}`,
        assigneeUserId: input.assigneeId,
        idempotencyKey: `email:reclean:${input.idempotencyKey}`,
      });
    }
  }

  return { duplicate: false as const, recleanJobId };
}

export async function listReviewsForJob(jobId: string, organizationId: string) {
  const db = getDb();
  return db
    .select()
    .from(reviews)
    .where(and(eq(reviews.jobId, jobId), eq(reviews.organizationId, organizationId)))
    .orderBy(asc(reviews.reviewedAt));
}

export async function addJobInternalNote(
  session: SessionPayload,
  input: { jobId: string; note: string },
) {
  if (!canReviewJobs(session.role)) throw new ForbiddenError();
  if (!input.note.trim()) throw new ForbiddenError("Note cannot be empty");
  const job = await getJobForOrganization(input.jobId, session.organizationId);
  if (!job) throw new NotFoundError();
  await recordAudit({
    organizationId: session.organizationId,
    actorId: session.userId,
    action: "job.internal_note",
    objectType: "job",
    objectId: input.jobId,
    payload: { note: input.note },
  });
}
