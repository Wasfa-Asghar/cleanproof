import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { auditEvents, evidence, issues, jobItemResults, jobSubmissions, jobs } from "@/db/schema";
import type { SessionPayload } from "@/lib/auth/session";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { countReadyEvidenceForItem } from "@/lib/db/evidence-queries";
import { getJobForOrganization, getJobForSession } from "@/lib/db/queries";

export type SubmitPayload = {
  jobId: string;
  idempotencyKey: string;
  items: Array<{
    itemId: string;
    result: "pass" | "fail" | "na" | "exception";
    exceptionReason?: string;
  }>;
};

export async function submitJobChecklistPayload(session: SessionPayload, payload: SubmitPayload) {
  const bundle = await getJobForSession(payload.jobId, session);
  if (!bundle?.template) throw new NotFoundError();

  const db = getDb();

  const [existingSubmission] = await db
    .select()
    .from(jobSubmissions)
    .where(
      and(eq(jobSubmissions.jobId, payload.jobId), eq(jobSubmissions.idempotencyKey, payload.idempotencyKey)),
    )
    .limit(1);
  if (existingSubmission) {
    return { duplicate: true as const };
  }

  for (const item of bundle.template.items) {
    if (item.evidencePolicy === "required") {
      const count = await countReadyEvidenceForItem(payload.jobId, item.id);
      if (count < 1) {
        throw new ForbiddenError(`Missing required photo for: ${item.label}`);
      }
    }
  }

  const beforeRows = await db
    .select({ id: evidence.id })
    .from(evidence)
    .where(
      and(
        eq(evidence.jobId, payload.jobId),
        eq(evidence.organizationId, session.organizationId),
        eq(evidence.kind, "before"),
        eq(evidence.scanState, "ready"),
      ),
    );
  const afterRows = await db
    .select({ id: evidence.id })
    .from(evidence)
    .where(
      and(
        eq(evidence.jobId, payload.jobId),
        eq(evidence.organizationId, session.organizationId),
        eq(evidence.kind, "after"),
        eq(evidence.scanState, "ready"),
      ),
    );

  if (beforeRows.length === 0 || afterRows.length === 0) {
    throw new ForbiddenError("Before and after site photos are required");
  }

  await db.transaction(async (tx) => {
    const [job] = await tx
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.id, payload.jobId),
          eq(jobs.organizationId, session.organizationId),
          eq(jobs.assignedUserId, session.userId),
        ),
      )
      .limit(1);
    if (!job) throw new NotFoundError();
    if (!["assigned", "in_progress"].includes(job.status)) {
      throw new ForbiddenError("Job already submitted");
    }

    await tx.insert(jobSubmissions).values({
      organizationId: session.organizationId,
      jobId: payload.jobId,
      idempotencyKey: payload.idempotencyKey,
      submittedBy: session.userId,
    });

    await tx.delete(jobItemResults).where(eq(jobItemResults.jobId, payload.jobId));

    const itemMap = new Map(payload.items.map((i) => [i.itemId, i]));
    for (const templateItem of bundle.template!.items) {
      const answer = itemMap.get(templateItem.id);
      const result = answer?.result ?? "pass";
      await tx.insert(jobItemResults).values({
        jobId: payload.jobId,
        itemId: templateItem.id,
        result,
        exceptionReason: answer?.exceptionReason ?? null,
        submittedAt: new Date(),
      });
    }

    await tx.update(jobs).set({ status: "needs_review" }).where(eq(jobs.id, payload.jobId));

    const [submittedJob] = await tx.select().from(jobs).where(eq(jobs.id, payload.jobId)).limit(1);
    if (submittedJob?.jobKind === "reclean") {
      await tx
        .update(issues)
        .set({ status: "ready_for_review" })
        .where(
          and(eq(issues.linkedRecleanJobId, payload.jobId), eq(issues.organizationId, session.organizationId)),
        );
    }

    await tx.insert(auditEvents).values({
      organizationId: session.organizationId,
      actorId: session.userId,
      action: "job.submitted",
      objectType: "job",
      objectId: payload.jobId,
    });
  });

  const job = await getJobForOrganization(payload.jobId, session.organizationId);
  if (job) {
    const { notifyJobSubmitted, notifyRecleanAwaitingReview } = await import("@/lib/notifications/dispatch");
    void notifyJobSubmitted({
      organizationId: session.organizationId,
      jobId: payload.jobId,
      jobTitle: job.title,
      idempotencyKey: `email:submit:${payload.idempotencyKey}`,
    });
    if (job.jobKind === "reclean") {
      void notifyRecleanAwaitingReview({
        organizationId: session.organizationId,
        jobId: payload.jobId,
        jobTitle: job.title,
        idempotencyKey: `email:reclean-review:${payload.idempotencyKey}`,
      });
    }
  }

  return { duplicate: false as const };
}
