import { and, eq, inArray, isNotNull, lt } from "drizzle-orm";
import { getDb } from "@/db";
import { issues } from "@/db/schema";
import { notifyIssueOverdue } from "@/lib/notifications/dispatch";

const OPEN_STATUSES = ["open", "acknowledged", "assigned", "work_in_progress", "ready_for_review"] as const;

/** Safe to run locally or from a future cron — idempotent per issue per UTC day. */
export async function processOverdueIssues(organizationId?: string) {
  const db = getDb();
  const now = new Date();
  const dayKey = now.toISOString().slice(0, 10);

  const conditions = [
    isNotNull(issues.dueAt),
    lt(issues.dueAt, now),
    inArray(issues.status, [...OPEN_STATUSES]),
  ];
  if (organizationId) conditions.push(eq(issues.organizationId, organizationId));

  const rows = await db
    .select()
    .from(issues)
    .where(and(...conditions));

  let processed = 0;
  for (const issue of rows) {
    await notifyIssueOverdue({
      organizationId: issue.organizationId,
      issueId: issue.id,
      issueTitle: issue.title,
      assigneeUserId: issue.assigneeId ?? undefined,
      idempotencyKey: `overdue:${issue.id}:${dayKey}`,
    });
    processed += 1;
  }
  return { processed, dayKey };
}
