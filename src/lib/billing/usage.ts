import { and, eq, gte, isNull, lt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { jobs, memberships, sites } from "@/db/schema";

/** Active cleaners: active membership with role cleaner only (owners/managers excluded). */
export async function countActiveCleaners(organizationId: string): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(memberships)
    .where(
      and(
        eq(memberships.organizationId, organizationId),
        eq(memberships.status, "active"),
        eq(memberships.role, "cleaner"),
      ),
    );
  return row?.count ?? 0;
}

/** Active sites: not archived. */
export async function countActiveSites(organizationId: string): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sites)
    .where(and(eq(sites.organizationId, organizationId), isNull(sites.archivedAt)));
  return row?.count ?? 0;
}

/** Jobs created in [periodStart, periodEnd). Uses job row createdAt when present, else startAt. */
export async function countJobsInBillingPeriod(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(jobs)
    .where(
      and(
        eq(jobs.organizationId, organizationId),
        gte(jobs.createdAt, periodStart),
        lt(jobs.createdAt, periodEnd),
      ),
    );
  return row?.count ?? 0;
}
