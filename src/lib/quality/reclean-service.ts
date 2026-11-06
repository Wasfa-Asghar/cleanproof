import { and, eq, notInArray } from "drizzle-orm";
import { getDb } from "@/db";
import { issues, jobs } from "@/db/schema";
import type { SessionPayload } from "@/lib/auth/session";
import { ISSUE_CATEGORIES } from "@/lib/issues/categories";

type DbTx = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];

export async function findActiveRecleanJob(
  organizationId: string,
  sourceJobId: string,
  tx?: DbTx,
) {
  const db = tx ?? getDb();
  const [row] = await db
    .select()
    .from(jobs)
    .where(
      and(
        eq(jobs.recleanSourceJobId, sourceJobId),
        eq(jobs.organizationId, organizationId),
        notInArray(jobs.status, ["approved", "closed", "cancelled"]),
      ),
    )
    .limit(1);
  return row;
}

export async function createRecleanJobForSource(
  tx: DbTx,
  input: {
    session: SessionPayload;
    sourceJob: typeof jobs.$inferSelect;
    assigneeId: string;
    reason: string;
    failedItemIds?: string[];
  },
) {
  const existing = await findActiveRecleanJob(input.session.organizationId, input.sourceJob.id, tx);
  if (existing) return existing.id;

  const [reclean] = await tx
    .insert(jobs)
    .values({
      organizationId: input.session.organizationId,
      siteId: input.sourceJob.siteId,
      templateVersionId: input.sourceJob.templateVersionId,
      title: `Re-clean: ${input.sourceJob.title}`,
      startAt: new Date(),
      status: "assigned",
      assignedUserId: input.assigneeId,
      jobKind: "reclean",
      recleanSourceJobId: input.sourceJob.id,
      reviewPriority: "high",
      failedItemIds: input.failedItemIds ?? input.sourceJob.failedItemIds ?? [],
    })
    .returning();

  await tx.insert(issues).values({
    organizationId: input.session.organizationId,
    jobId: input.sourceJob.id,
    siteId: input.sourceJob.siteId,
    title: `Re-clean required: ${input.sourceJob.title}`,
    description: input.reason,
    category: ISSUE_CATEGORIES.incompleteChecklist,
    severity: "high",
    status: "assigned",
    source: "internal",
    assigneeId: input.assigneeId,
    createdById: input.session.userId,
    linkedRecleanJobId: reclean.id,
  });

  return reclean.id;
}
