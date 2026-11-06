import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { auditEvents, issueActivities, issues, jobs } from "@/db/schema";
import type { SessionPayload } from "@/lib/auth/session";
import { canManageIssues } from "@/lib/constants/roles";
import type { IssueStatus } from "@/lib/data/types";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { ISSUE_CATEGORIES, type IssueCategory } from "@/lib/issues/categories";
import { canTransitionIssue } from "@/lib/issues/transitions";
import { getIssueForOrganization, getSiteForOrganization } from "@/lib/db/queries";

function assertIssueManager(session: SessionPayload) {
  if (!canManageIssues(session.role)) throw new ForbiddenError();
}

export async function createIssue(
  session: SessionPayload,
  input: {
    siteId: string;
    jobId?: string;
    title: string;
    description?: string;
    category: IssueCategory;
    severity: "low" | "medium" | "high";
    assigneeId?: string;
    dueAt?: Date;
    source?: "internal" | "complaint" | "client";
  },
) {
  assertIssueManager(session);
  const site = await getSiteForOrganization(input.siteId, session.organizationId);
  if (!site) throw new NotFoundError();

  const db = getDb();
  const [row] = await db
    .insert(issues)
    .values({
      organizationId: session.organizationId,
      siteId: input.siteId,
      jobId: input.jobId ?? null,
      title: input.title,
      description: input.description ?? null,
      category: input.category,
      severity: input.severity,
      status: input.assigneeId ? "assigned" : "open",
      source: input.source ?? "internal",
      assigneeId: input.assigneeId ?? null,
      createdById: session.userId,
      dueAt: input.dueAt ?? null,
    })
    .returning();

  await db.insert(issueActivities).values({
    organizationId: session.organizationId,
    issueId: row.id,
    actorId: session.userId,
    action: "issue.created",
    body: input.description ?? input.title,
    isInternal: true,
  });

  await db.insert(auditEvents).values({
    organizationId: session.organizationId,
    actorId: session.userId,
    action: "issue.created",
    objectType: "issue",
    objectId: row.id,
  });

  return row;
}

export async function createCustomerComplaint(
  session: SessionPayload,
  input: {
    jobId: string;
    description: string;
    severity: "low" | "medium" | "high";
    assigneeId?: string;
    dueAt?: Date;
    internalNotes?: string;
  },
) {
  assertIssueManager(session);
  const db = getDb();
  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, input.jobId), eq(jobs.organizationId, session.organizationId)))
    .limit(1);
  if (!job) throw new NotFoundError();

  const issue = await createIssue(session, {
    siteId: job.siteId,
    jobId: job.id,
    title: `Customer complaint: ${job.title}`,
    description: input.description,
    category: ISSUE_CATEGORIES.customerComplaint,
    severity: input.severity,
    assigneeId: input.assigneeId,
    dueAt: input.dueAt,
    source: "complaint",
  });

  if (input.internalNotes?.trim()) {
    await addIssueActivity(session, {
      issueId: issue.id,
      action: "complaint.internal_note",
      body: input.internalNotes,
      isInternal: true,
    });
  }

  const { notifyComplaintCreated } = await import("@/lib/notifications/dispatch");
  void notifyComplaintCreated({
    organizationId: session.organizationId,
    issueId: issue.id,
    title: issue.title,
    idempotencyKey: `email:complaint:${issue.id}`,
  });

  return issue;
}

export async function updateIssueStatus(
  session: SessionPayload,
  input: { issueId: string; status: IssueStatus; resolutionNotes?: string },
) {
  assertIssueManager(session);
  const existing = await getIssueForOrganization(input.issueId, session.organizationId);
  if (!existing) throw new NotFoundError();
  if (!canTransitionIssue(existing.status, input.status)) {
    throw new ForbiddenError("Invalid issue status transition");
  }

  const db = getDb();
  const [updated] = await db
    .update(issues)
    .set({
      status: input.status,
      resolutionNotes: input.resolutionNotes ?? existing.resolutionNotes,
      closedAt: input.status === "closed" ? new Date() : existing.closedAt,
    })
    .where(and(eq(issues.id, input.issueId), eq(issues.organizationId, session.organizationId)))
    .returning();

  await addIssueActivity(session, {
    issueId: input.issueId,
    action: "issue.status_changed",
    body: `Status → ${input.status}`,
    isInternal: true,
  });

  if (input.status === "resolved" || input.status === "closed") {
    await db.insert(auditEvents).values({
      organizationId: session.organizationId,
      actorId: session.userId,
      action: input.status === "closed" ? "issue.closed" : "issue.resolved",
      objectType: "issue",
      objectId: input.issueId,
    });
  }

  return updated;
}

export async function assignIssue(
  session: SessionPayload,
  input: { issueId: string; assigneeId: string },
) {
  assertIssueManager(session);
  const existing = await getIssueForOrganization(input.issueId, session.organizationId);
  if (!existing) throw new NotFoundError();
  const nextStatus: IssueStatus =
    existing.status === "open" || existing.status === "acknowledged" ? "assigned" : existing.status;
  if (!canTransitionIssue(existing.status, nextStatus) && existing.status !== "assigned") {
    throw new ForbiddenError("Cannot assign issue in this status");
  }
  const db = getDb();
  await db
    .update(issues)
    .set({ assigneeId: input.assigneeId, status: nextStatus })
    .where(and(eq(issues.id, input.issueId), eq(issues.organizationId, session.organizationId)));
  await addIssueActivity(session, {
    issueId: input.issueId,
    action: "issue.assigned",
    body: `Assigned to ${input.assigneeId}`,
    isInternal: true,
  });

  const issue = await getIssueForOrganization(input.issueId, session.organizationId);
  if (issue?.category === ISSUE_CATEGORIES.customerComplaint) {
    const { notifyComplaintAssigned } = await import("@/lib/notifications/dispatch");
    void notifyComplaintAssigned({
      organizationId: session.organizationId,
      issueId: input.issueId,
      assigneeUserId: input.assigneeId,
      title: issue.title,
      idempotencyKey: `email:complaint-assign:${input.issueId}:${input.assigneeId}`,
    });
  }
}

export async function addIssueActivity(
  session: SessionPayload | null,
  input: { issueId: string; action: string; body?: string; isInternal: boolean },
) {
  const db = getDb();
  const [issue] = await db.select().from(issues).where(eq(issues.id, input.issueId)).limit(1);
  if (!issue) throw new NotFoundError();
  if (session && issue.organizationId !== session.organizationId) throw new ForbiddenError();

  await db.insert(issueActivities).values({
    organizationId: issue.organizationId,
    issueId: input.issueId,
    actorId: session?.userId ?? null,
    action: input.action,
    body: input.body ?? null,
    isInternal: input.isInternal,
  });
}

export async function listIssueActivities(issueId: string, organizationId: string, includeInternal: boolean) {
  const db = getDb();
  const rows = await db
    .select()
    .from(issueActivities)
    .where(and(eq(issueActivities.issueId, issueId), eq(issueActivities.organizationId, organizationId)))
    .orderBy(issueActivities.createdAt);
  return includeInternal ? rows : rows.filter((r) => !r.isInternal);
}

export async function markRecleanSubmitted(recleanJobId: string, organizationId: string) {
  const db = getDb();
  await db
    .update(issues)
    .set({ status: "ready_for_review" })
    .where(and(eq(issues.linkedRecleanJobId, recleanJobId), eq(issues.organizationId, organizationId)));
}

export async function resolveIssueForApprovedReclean(recleanJobId: string, organizationId: string, actorId: string) {
  const db = getDb();
  const [issue] = await db
    .select()
    .from(issues)
    .where(and(eq(issues.linkedRecleanJobId, recleanJobId), eq(issues.organizationId, organizationId)))
    .limit(1);
  if (!issue) return;

  await db
    .update(issues)
    .set({ status: "resolved", closedAt: new Date() })
    .where(eq(issues.id, issue.id));

  await db.insert(auditEvents).values({
    organizationId,
    actorId,
    action: "issue.resolved",
    objectType: "issue",
    objectId: issue.id,
    payload: { viaRecleanApproval: recleanJobId },
  });
}

export async function createClientIssueFromReportToken(
  token: string,
  input: { description: string; contactName?: string },
) {
  const { getReportByToken } = await import("@/lib/db/queries");
  const report = await getReportByToken(token);
  if (!report?.job || report.job.status !== "approved") {
    throw new ForbiddenError("Report is not available for issue intake");
  }

  const db = getDb();
  const [row] = await db
    .insert(issues)
    .values({
      organizationId: report.org.id,
      siteId: report.site.id,
      jobId: report.job.id,
      title: `Client report: ${report.site.name}`,
      description: input.description,
      category: ISSUE_CATEGORIES.customerComplaint,
      severity: "medium",
      status: "open",
      source: "client",
    })
    .returning();

  await db.insert(issueActivities).values({
    organizationId: report.org.id,
    issueId: row.id,
    actorId: null,
    action: "issue.client_submitted",
    body: input.contactName ? `${input.contactName}: ${input.description}` : input.description,
    isInternal: false,
  });

  await db.insert(auditEvents).values({
    organizationId: report.org.id,
    actorId: null,
    action: "issue.client_submitted",
    objectType: "issue",
    objectId: row.id,
  });

  return { issueId: row.id, reference: row.id.slice(0, 8).toUpperCase() };
}
