import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { auditEvents, issues, jobs } from "@/db/schema";
import { ISSUE_CATEGORIES } from "@/lib/issues/categories";

export async function getPhase3Metrics(organizationId: string) {
  const db = getDb();
  const jobRows = await db.select().from(jobs).where(eq(jobs.organizationId, organizationId));
  const issueRows = await db.select().from(issues).where(eq(issues.organizationId, organizationId));
  const now = Date.now();

  const awaitingReview = jobRows.filter((j) => j.status === "needs_review" || j.status === "submitted").length;
  const approvedJobs = jobRows.filter((j) => j.status === "approved").length;
  const needingCorrection = jobRows.filter((j) => j.status === "rejected").length;
  const recleanCount = jobRows.filter((j) => j.jobKind === "reclean").length;

  const openComplaints = issueRows.filter(
    (i) => i.category === ISSUE_CATEGORIES.customerComplaint && !["closed", "resolved"].includes(i.status),
  ).length;

  const overdueIssues = issueRows.filter(
    (i) =>
      i.dueAt &&
      i.dueAt.getTime() < now &&
      !["closed", "resolved", "client_notified"].includes(i.status),
  ).length;

  const submittedCount = jobRows.filter((j) =>
    ["needs_review", "submitted", "approved", "rejected"].includes(j.status),
  ).length;
  const qualityApprovalRate =
    submittedCount === 0 ? 0 : Math.round((approvedJobs / submittedCount) * 100);

  const resolvedIssues = issueRows.filter((i) => i.status === "resolved" || i.status === "closed");
  const resolutionDurations = resolvedIssues
    .map((i) => (i.closedAt ?? i.dueAt)?.getTime())
    .filter(Boolean) as number[];
  const avgResolutionMs =
    resolutionDurations.length === 0
      ? 0
      : resolutionDurations.reduce((a, b) => a + b, 0) / resolutionDurations.length;

  const auditResolution = await db
    .select({ createdAt: auditEvents.createdAt, objectId: auditEvents.objectId })
    .from(auditEvents)
    .where(
      and(eq(auditEvents.organizationId, organizationId), inArray(auditEvents.action, ["issue.resolved", "issue.closed"])),
    );

  let avgResolutionHours = 0;
  if (auditResolution.length > 0) {
    const issueCreated = new Map(issueRows.map((i) => [i.id, i.createdAt.getTime()]));
    const deltas = auditResolution
      .map((a) => {
        const start = issueCreated.get(a.objectId);
        if (!start) return null;
        return a.createdAt.getTime() - start;
      })
      .filter((d): d is number => d !== null && d >= 0);
    avgResolutionHours =
      deltas.length === 0 ? 0 : Math.round(deltas.reduce((s, d) => s + d, 0) / deltas.length / 3600000);
  }

  return {
    awaitingReview,
    approvedJobs,
    needingCorrection,
    openComplaints,
    overdueIssues,
    recleanCount,
    qualityApprovalRate,
    avgResolutionHours,
    avgResolutionMs,
  };
}

export async function listQualityQueueJobs(
  organizationId: string,
  filters: {
    status?: string[];
    siteId?: string;
    assignedUserId?: string;
    priority?: string;
    from?: Date;
    to?: Date;
  },
) {
  const db = getDb();
  let rows = await db.select().from(jobs).where(eq(jobs.organizationId, organizationId));

  const statuses = filters.status?.length
    ? filters.status
    : ["submitted", "needs_review"];
  rows = rows.filter((j) => statuses.includes(j.status));

  if (filters.siteId) rows = rows.filter((j) => j.siteId === filters.siteId);
  if (filters.assignedUserId) rows = rows.filter((j) => j.assignedUserId === filters.assignedUserId);
  if (filters.priority) rows = rows.filter((j) => j.reviewPriority === filters.priority);
  if (filters.from) rows = rows.filter((j) => j.startAt >= filters.from!);
  if (filters.to) rows = rows.filter((j) => j.startAt <= filters.to!);

  return rows.sort((a, b) => b.startAt.getTime() - a.startAt.getTime());
}
