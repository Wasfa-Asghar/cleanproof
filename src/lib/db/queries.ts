import { and, asc, eq, gt, inArray, isNull, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  auditEvents,
  checklistTemplateVersions,
  checklistTemplates,
  clients,
  evidence,
  jobItemResults,
  jobs,
  issues,
  memberships,
  organizations,
  reportShares,
  sites,
  subscriptions,
  templateItems,
  users,
} from "@/db/schema";
import { hashToken } from "@/lib/crypto/tokens";
import type { MembershipRole } from "@/lib/constants/roles";
import type { JobStatus } from "@/lib/data/types";
import { NotFoundError } from "@/lib/errors";
import type { SessionPayload } from "@/lib/auth/session";

function mapJob(row: typeof jobs.$inferSelect) {
  return {
    id: row.id,
    organizationId: row.organizationId,
    siteId: row.siteId,
    templateVersionId: row.templateVersionId,
    title: row.title,
    startAt: row.startAt.toISOString(),
    endAt: row.endAt?.toISOString(),
    status: row.status as JobStatus,
    assignedUserId: row.assignedUserId ?? undefined,
    jobKind: row.jobKind,
    recleanSourceJobId: row.recleanSourceJobId ?? undefined,
    reviewPriority: row.reviewPriority,
    failedItemIds: (row.failedItemIds as string[] | null) ?? [],
  };
}

export async function getUserByEmail(email: string) {
  const db = getDb();
  const [row] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return row;
}

export async function getUserById(id: string) {
  const db = getDb();
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return row;
}

export async function getMembershipForUser(userId: string, organizationId?: string) {
  const db = getDb();
  const conditions = [eq(memberships.userId, userId), eq(memberships.status, "active")];
  if (organizationId) conditions.push(eq(memberships.organizationId, organizationId));

  const rows = await db
    .select({
      membership: memberships,
      organization: organizations,
    })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.organizationId, organizations.id))
    .where(and(...conditions))
    .limit(1);

  const row = rows[0];
  if (!row) return undefined;
  return {
    id: row.membership.id,
    organizationId: row.membership.organizationId,
    userId: row.membership.userId,
    role: row.membership.role as MembershipRole,
    status: row.membership.status as "active" | "revoked",
    organization: {
      id: row.organization.id,
      legalName: row.organization.legalName,
      displayName: row.organization.displayName,
      region: row.organization.region,
      currency: row.organization.currency,
      timeZone: row.organization.timeZone,
    },
  };
}

export async function listJobsForOrg(organizationId: string) {
  const db = getDb();
  const rows = await db.select().from(jobs).where(eq(jobs.organizationId, organizationId));
  return rows.map(mapJob);
}

export async function listJobsForCleaner(session: SessionPayload) {
  const db = getDb();
  const rows = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.organizationId, session.organizationId), eq(jobs.assignedUserId, session.userId)));
  return rows.map(mapJob);
}

export async function getTemplateBundleByVersionId(templateVersionId: string, organizationId: string) {
  const db = getDb();
  const versionRows = await db
    .select({
      version: checklistTemplateVersions,
      template: checklistTemplates,
    })
    .from(checklistTemplateVersions)
    .innerJoin(checklistTemplates, eq(checklistTemplateVersions.templateId, checklistTemplates.id))
    .where(
      and(
        eq(checklistTemplateVersions.id, templateVersionId),
        eq(checklistTemplates.organizationId, organizationId),
      ),
    )
    .limit(1);

  const bundle = versionRows[0];
  if (!bundle) return undefined;

  const items = await db
    .select()
    .from(templateItems)
    .where(eq(templateItems.templateVersionId, templateVersionId))
    .orderBy(templateItems.sortOrder);

  return {
    id: bundle.template.id,
    organizationId: bundle.template.organizationId,
    name: bundle.template.name,
    version: bundle.version.version,
    versionId: bundle.version.id,
    items: items.map((item) => ({
      id: item.id,
      section: item.section,
      label: item.label,
      taskType: item.taskType as "checkbox" | "yes_no" | "numeric" | "image" | "exception",
      required: item.required,
      evidencePolicy: item.evidencePolicy as "none" | "optional" | "required",
      sortOrder: item.sortOrder,
    })),
  };
}

async function getJobBundle(jobId: string, organizationId: string) {
  const db = getDb();
  const [jobRow] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.organizationId, organizationId)))
    .limit(1);
  if (!jobRow) return undefined;

  const [siteRow] = await db
    .select()
    .from(sites)
    .where(and(eq(sites.id, jobRow.siteId), eq(sites.organizationId, organizationId)))
    .limit(1);
  if (!siteRow) return undefined;

  const template = await getTemplateBundleByVersionId(jobRow.templateVersionId, organizationId);
  const results = await db.select().from(jobItemResults).where(eq(jobItemResults.jobId, jobId));

  return {
    job: mapJob(jobRow),
    site: {
      id: siteRow.id,
      organizationId: siteRow.organizationId,
      clientId: siteRow.clientId,
      name: siteRow.name,
      addressLine1: siteRow.addressLine1,
      city: siteRow.city,
      postcode: siteRow.postcode,
      country: siteRow.country,
      timeZone: siteRow.timeZone,
      instructions: siteRow.instructions ?? undefined,
      accessSensitivity: siteRow.accessSensitivity as "standard" | "restricted",
    },
    template,
    results: results.map((r) => ({
      id: r.id,
      jobId: r.jobId,
      itemId: r.itemId,
      result: r.result as "pass" | "fail" | "na" | "exception",
      exceptionReason: r.exceptionReason ?? undefined,
      note: r.note ?? undefined,
      submittedAt: r.submittedAt?.toISOString(),
    })),
  };
}

export async function getJobForSession(jobId: string, session: SessionPayload) {
  const bundle = await getJobBundle(jobId, session.organizationId);
  if (!bundle) return undefined;
  if (session.role === "cleaner" && bundle.job.assignedUserId !== session.userId) return undefined;
  return bundle;
}

/** Cross-tenant probe: returns job only when organization matches. */
export async function getJobForOrganization(jobId: string, organizationId: string) {
  const db = getDb();
  const [jobRow] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.organizationId, organizationId)))
    .limit(1);
  return jobRow ? mapJob(jobRow) : undefined;
}

export async function getSiteForOrganization(siteId: string, organizationId: string) {
  const db = getDb();
  const [siteRow] = await db
    .select()
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.organizationId, organizationId)))
    .limit(1);
  if (!siteRow) return undefined;
  return {
    id: siteRow.id,
    organizationId: siteRow.organizationId,
    clientId: siteRow.clientId,
    name: siteRow.name,
    addressLine1: siteRow.addressLine1,
    city: siteRow.city,
    postcode: siteRow.postcode,
    country: siteRow.country,
    timeZone: siteRow.timeZone,
    instructions: siteRow.instructions ?? undefined,
    accessSensitivity: siteRow.accessSensitivity as "standard" | "restricted",
  };
}

export async function listClientsForOrg(organizationId: string) {
  const db = getDb();
  return db.select().from(clients).where(eq(clients.organizationId, organizationId));
}

export async function listSitesForOrg(organizationId: string) {
  const db = getDb();
  return db.select().from(sites).where(eq(sites.organizationId, organizationId));
}

export async function listTemplatesForOrg(organizationId: string) {
  const db = getDb();
  const templates = await db.select().from(checklistTemplates).where(eq(checklistTemplates.organizationId, organizationId));
  const out = [];
  for (const t of templates) {
    const [version] = await db
      .select()
      .from(checklistTemplateVersions)
      .where(eq(checklistTemplateVersions.templateId, t.id))
      .orderBy(sql`${checklistTemplateVersions.version} desc`)
      .limit(1);
    if (!version) continue;
    const bundle = await getTemplateBundleByVersionId(version.id, organizationId);
    if (bundle) out.push(bundle);
  }
  return out;
}

export async function listIssuesForOrg(organizationId: string) {
  const db = getDb();
  return db.select().from(issues).where(eq(issues.organizationId, organizationId));
}

export async function listReportSharesForOrg(organizationId: string) {
  const db = getDb();
  return db.select().from(reportShares).where(eq(reportShares.organizationId, organizationId));
}

export async function listMembershipsForOrg(organizationId: string) {
  const db = getDb();
  return db.select().from(memberships).where(and(eq(memberships.organizationId, organizationId), eq(memberships.status, "active")));
}

export async function listTeamMembersForOrg(organizationId: string) {
  const db = getDb();
  const rows = await db
    .select({ userId: users.id, name: users.name, role: memberships.role })
    .from(memberships)
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(and(eq(memberships.organizationId, organizationId), eq(memberships.status, "active")));
  return rows.map((r) => ({ id: r.userId, name: r.name, role: r.role }));
}

export async function listAuditForJob(jobId: string, organizationId: string) {
  const db = getDb();
  return db
    .select()
    .from(auditEvents)
    .where(
      and(eq(auditEvents.organizationId, organizationId), eq(auditEvents.objectType, "job"), eq(auditEvents.objectId, jobId)),
    )
    .orderBy(asc(auditEvents.createdAt));
}

export async function getSubscriptionForOrg(organizationId: string) {
  const db = getDb();
  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.organizationId, organizationId)).limit(1);
  return sub;
}

export async function getOrgDashboard(organizationId: string) {
  const db = getDb();
  const jobRows = await db.select().from(jobs).where(eq(jobs.organizationId, organizationId));
  const issueRows = await db.select().from(issues).where(eq(issues.organizationId, organizationId));
  const siteRows = await db.select().from(sites).where(eq(sites.organizationId, organizationId));
  const memberRows = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.organizationId, organizationId), eq(memberships.status, "active")));

  const now = Date.now();
  const mapped = jobRows.map(mapJob);
  return {
    jobsTotal: mapped.length,
    needsReview: mapped.filter((j) => j.status === "needs_review" || j.status === "submitted").length,
    inProgress: mapped.filter((j) => j.status === "in_progress").length,
    overdue: mapped.filter(
      (j) => new Date(j.startAt).getTime() < now && !["approved", "closed", "cancelled"].includes(j.status),
    ).length,
    openIssues: issueRows.filter((i) => !["closed", "resolved", "client_notified"].includes(i.status)).length,
    sites: siteRows.length,
    team: memberRows.length,
  };
}

export async function countJobResultsWithExceptions(organizationId: string) {
  const db = getDb();
  const orgJobs = await db.select({ id: jobs.id }).from(jobs).where(eq(jobs.organizationId, organizationId));
  const ids = orgJobs.map((j) => j.id);
  if (ids.length === 0) return 0;
  const results = await db
    .select()
    .from(jobItemResults)
    .where(and(inArray(jobItemResults.jobId, ids), or(eq(jobItemResults.result, "exception"), eq(jobItemResults.result, "fail"))));
  return results.length;
}

export async function getReportByToken(token: string) {
  const { connection } = await import("next/server");
  await connection();
  const db = getDb();
  const tokenHash = hashToken(token);
  const now = new Date();
  const [share] = await db
    .select()
    .from(reportShares)
    .where(
      and(eq(reportShares.tokenHash, tokenHash), isNull(reportShares.revokedAt), gt(reportShares.expiresAt, now)),
    )
    .limit(1);
  if (!share) return undefined;

  const [org] = await db.select().from(organizations).where(eq(organizations.id, share.organizationId)).limit(1);
  if (!org) return undefined;
  const bundle = await getJobBundle(share.jobId, share.organizationId);
  if (!bundle?.site) return undefined;
  if (bundle.job.status !== "approved") return undefined;

  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, bundle.site.clientId), eq(clients.organizationId, share.organizationId)))
    .limit(1);

  return {
    share: {
      id: share.id,
      organizationId: share.organizationId,
      jobId: share.jobId,
      expiresAt: share.expiresAt.toISOString(),
    },
    org: {
      id: org.id,
      legalName: org.legalName,
      displayName: org.displayName,
      region: org.region,
      currency: org.currency,
      timeZone: org.timeZone,
    },
    client,
    ...bundle,
  };
}

export async function getDemoUserByRole(role: MembershipRole) {
  const email =
    role === "owner"
      ? "owner@demo.cleanproof.app"
      : role === "manager"
        ? "manager@demo.cleanproof.app"
        : "cleaner@demo.cleanproof.app";
  return getUserByEmail(email);
}

export async function assertNoCrossTenantJobAccess(jobId: string, organizationId: string) {
  const job = await getJobForOrganization(jobId, organizationId);
  if (!job) throw new NotFoundError();
  return job;
}

export async function getEvidenceForOrganization(evidenceId: string, organizationId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(evidence)
    .where(and(eq(evidence.id, evidenceId), eq(evidence.organizationId, organizationId)))
    .limit(1);
  return row;
}

export async function getIssueForOrganization(issueId: string, organizationId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(issues)
    .where(and(eq(issues.id, issueId), eq(issues.organizationId, organizationId)))
    .limit(1);
  return row;
}

export async function getReportShareForOrganization(shareId: string, organizationId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(reportShares)
    .where(and(eq(reportShares.id, shareId), eq(reportShares.organizationId, organizationId)))
    .limit(1);
  return row;
}

export async function getMembershipForOrganization(membershipId: string, organizationId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.id, membershipId), eq(memberships.organizationId, organizationId)))
    .limit(1);
  return row;
}
