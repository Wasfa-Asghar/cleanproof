import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { clients, issues, jobs, memberships, sites, users } from "@/db/schema";
import { toCsvRow } from "@/lib/csv/sanitize";
import type { SessionPayload } from "@/lib/auth/session";
import { canManageIssues, canManageTeam } from "@/lib/constants/roles";
import { ForbiddenError } from "@/lib/errors";

export async function exportClientsCsv(session: SessionPayload) {
  if (session.role !== "owner" && session.role !== "manager") throw new ForbiddenError();
  const db = getDb();
  const rows = await db.select().from(clients).where(eq(clients.organizationId, session.organizationId));
  const lines = [
    toCsvRow(["display_name", "id", "created_at"]),
    ...rows.map((r) => toCsvRow([r.displayName, r.id, r.createdAt.toISOString()])),
  ];
  return lines.join("\n");
}

export async function exportSitesCsv(session: SessionPayload) {
  if (session.role !== "owner" && session.role !== "manager") throw new ForbiddenError();
  const db = getDb();
  const rows = await db.select().from(sites).where(eq(sites.organizationId, session.organizationId));
  const lines = [
    toCsvRow(["name", "client_id", "address", "city", "postcode", "id"]),
    ...rows.map((r) =>
      toCsvRow([r.name, r.clientId, r.addressLine1, r.city, r.postcode, r.id]),
    ),
  ];
  return lines.join("\n");
}

export async function exportJobsCsv(session: SessionPayload) {
  if (session.role !== "owner" && session.role !== "manager") throw new ForbiddenError();
  const db = getDb();
  const rows = await db.select().from(jobs).where(eq(jobs.organizationId, session.organizationId));
  const lines = [
    toCsvRow(["title", "status", "site_id", "assigned_user_id", "start_at", "id"]),
    ...rows.map((r) =>
      toCsvRow([
        r.title,
        r.status,
        r.siteId,
        r.assignedUserId ?? "",
        r.startAt.toISOString(),
        r.id,
      ]),
    ),
  ];
  return lines.join("\n");
}

export async function exportIssuesCsv(session: SessionPayload) {
  if (!canManageIssues(session.role)) throw new ForbiddenError();
  const db = getDb();
  const rows = await db.select().from(issues).where(eq(issues.organizationId, session.organizationId));
  const lines = [
    toCsvRow(["title", "category", "status", "severity", "site_id", "job_id", "id"]),
    ...rows.map((r) =>
      toCsvRow([r.title, r.category, r.status, r.severity, r.siteId, r.jobId ?? "", r.id]),
    ),
  ];
  return lines.join("\n");
}

export async function exportTeamCsv(session: SessionPayload) {
  if (!canManageTeam(session.role)) throw new ForbiddenError();
  const db = getDb();
  const rows = await db
    .select({ email: users.email, name: users.name, role: memberships.role })
    .from(memberships)
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(eq(memberships.organizationId, session.organizationId));
  const lines = [toCsvRow(["name", "email", "role"]), ...rows.map((r) => toCsvRow([r.name, r.email, r.role]))];
  return lines.join("\n");
}
