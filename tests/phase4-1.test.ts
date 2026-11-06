import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { emailOutbox, issues, reportShares, teamInvitations } from "@/db/schema";
import { buildInternalReportPdf, buildPublicReportPdf } from "@/lib/reports/pdf-access";
import { uploadOrgLogo } from "@/lib/org/logo";
import { buildJobReportPdf } from "@/lib/pdf/job-report";
import { createJobForOrg, updateJobSchedule } from "@/lib/jobs/create-job";
import { processOverdueIssues } from "@/lib/notifications/overdue-processor";
import { NOTIFICATION_EVENTS } from "@/lib/notifications/types";
import { importSitesConfirmed, parseSitesCsv } from "@/lib/csv/import-sites";
import { importTeamConfirmed, parseTeamCsv } from "@/lib/csv/import-team";
import { approveJobReview } from "@/lib/quality/review-service";
import { submitJobChecklistPayload } from "@/lib/jobs/submit-payload";
import { startJob } from "@/lib/db/mutations";
import { hashToken } from "@/lib/crypto/tokens";
import type { SessionPayload } from "@/lib/auth/session";
import { createMinimalOrg, truncateAll } from "./helpers/fixtures";
import { seedBeforeAfterEvidence } from "./helpers/evidence";
import { ensureMigrated } from "./helpers/migrate";

describe("phase 4.1 pdf branding, notifications, csv wizard", () => {
  beforeAll(async () => {
    process.env.APP_URL = "http://localhost:3000";
    const { getEnv, resetEnvCacheForTests } = await import("@/lib/env");
    resetEnvCacheForTests();
    getEnv();
    await ensureMigrated();
  });

  beforeEach(async () => {
    await truncateAll();
  });

  async function approveFixtureJob(fixture: Awaited<ReturnType<typeof createMinimalOrg>>) {
    const cleaner: SessionPayload = {
      userId: fixture.cleaner.id,
      organizationId: fixture.org.id,
      role: "cleaner",
    };
    const manager: SessionPayload = {
      userId: fixture.owner.id,
      organizationId: fixture.org.id,
      role: "owner",
    };
    await startJob(fixture.job.id, cleaner);
    await seedBeforeAfterEvidence({ session: cleaner, jobId: fixture.job.id });
    await submitJobChecklistPayload(cleaner, {
      jobId: fixture.job.id,
      idempotencyKey: "p41-sub",
      items: [],
    });
    await approveJobReview(manager, { jobId: fixture.job.id, idempotencyKey: "p41-appr" });
  }

  it("embeds PNG logo in PDF when configured", async () => {
    const fixture = await createMinimalOrg("LogoPdf");
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    );
    await uploadOrgLogo({
      organizationId: fixture.org.id,
      body: png,
      mimeType: "image/png",
    });
    await approveFixtureJob(fixture);
    const pdf = await buildInternalReportPdf(fixture.org.id, fixture.job.id, false);
    expect(pdf.length).toBeGreaterThan(800);
  });

  it("generates PDF without logo when none uploaded", async () => {
    const fixture = await createMinimalOrg("NoLogo");
    await approveFixtureJob(fixture);
    const pdf = await buildJobReportPdf({
      organizationId: fixture.org.id,
      jobId: fixture.job.id,
      includeInternalNotes: false,
      paperSize: "Letter",
    });
    expect(Buffer.from(pdf).subarray(0, 4).toString()).toBe("%PDF");
  });

  it("denies public PDF for revoked report token", async () => {
    const fixture = await createMinimalOrg("RevokedPdf");
    await approveFixtureJob(fixture);
    const token = "revoked-token-test";
    const db = getDb();
    await db
      .update(reportShares)
      .set({ tokenHash: hashToken(token), revokedAt: new Date() })
      .where(eq(reportShares.id, fixture.share.id));
    await expect(buildPublicReportPdf(token)).rejects.toThrow();
  });

  it("notifies on job assign and schedule change without duplicate emails", async () => {
    const fixture = await createMinimalOrg("JobNotify");
    const owner: SessionPayload = {
      userId: fixture.owner.id,
      organizationId: fixture.org.id,
      role: "owner",
    };
    const job = await createJobForOrg(owner, {
      siteId: fixture.site.id,
      title: "Extra visit",
      startAt: new Date(Date.now() + 3600000),
      assignedUserId: fixture.cleaner.id,
      idempotencyKey: "assign-once",
    });
    await new Promise((r) => setTimeout(r, 50));
    let rows = await getDb()
      .select()
      .from(emailOutbox)
      .where(eq(emailOutbox.organizationId, fixture.org.id));
    const assignEmails = rows.filter((r) => r.notificationType === NOTIFICATION_EVENTS.jobAssigned);
    expect(assignEmails.length).toBe(1);

    const newStart = new Date(Date.now() + 7200000);
    await updateJobSchedule(owner, {
      jobId: job.id,
      startAt: newStart,
      idempotencyKey: "sched-once",
    });
    await new Promise((r) => setTimeout(r, 50));
    rows = await getDb().select().from(emailOutbox).where(eq(emailOutbox.organizationId, fixture.org.id));
    expect(rows.filter((r) => r.notificationType === NOTIFICATION_EVENTS.jobScheduleChanged).length).toBe(1);

    await updateJobSchedule(owner, { jobId: job.id, startAt: newStart, idempotencyKey: "sched-once" });
    await new Promise((r) => setTimeout(r, 50));
    rows = await getDb().select().from(emailOutbox).where(eq(emailOutbox.organizationId, fixture.org.id));
    expect(rows.filter((r) => r.notificationType === NOTIFICATION_EVENTS.jobScheduleChanged).length).toBe(1);
  });

  it("processes overdue issues idempotently per day", async () => {
    const fixture = await createMinimalOrg("Overdue");
    const db = getDb();
    await db
      .update(issues)
      .set({ dueAt: new Date(Date.now() - 3600000), assigneeId: fixture.cleaner.id })
      .where(eq(issues.id, fixture.issue.id));

    await processOverdueIssues(fixture.org.id);
    await new Promise((r) => setTimeout(r, 50));
    let rows = await getDb()
      .select()
      .from(emailOutbox)
      .where(eq(emailOutbox.organizationId, fixture.org.id));
    const overdue = rows.filter((r) => r.notificationType === NOTIFICATION_EVENTS.issueOverdue);
    expect(overdue.length).toBeGreaterThan(0);

    await processOverdueIssues(fixture.org.id);
    await new Promise((r) => setTimeout(r, 50));
    rows = await getDb().select().from(emailOutbox).where(eq(emailOutbox.organizationId, fixture.org.id));
    expect(rows.filter((r) => r.notificationType === NOTIFICATION_EVENTS.issueOverdue).length).toBe(overdue.length);
  });

  it("imports sites and team invitations with org isolation", async () => {
    const a = await createMinimalOrg("OrgA");
    const b = await createMinimalOrg("OrgB");

    const siteCsv = `name,client_name,address_line1,city,postcode,country\nNew Site,${a.org.displayName} Client,2 Road,London,E2 2BB,GB`;
    const siteRows = parseSitesCsv(siteCsv);
    const siteResult = await importSitesConfirmed(a.org.id, a.owner.id, siteRows);
    expect(siteResult.success).toBe(1);

    const teamCsv = "email,name,role\nteam.new@test.cleanproof,New Person,cleaner";
    const teamRows = parseTeamCsv(teamCsv);
    await importTeamConfirmed(a.org.id, a.owner.id, teamRows);
    const invitesA = await getDb()
      .select()
      .from(teamInvitations)
      .where(eq(teamInvitations.organizationId, a.org.id));
    expect(invitesA.length).toBe(1);

    const invitesB = await getDb()
      .select()
      .from(teamInvitations)
      .where(eq(teamInvitations.organizationId, b.org.id));
    expect(invitesB.length).toBe(0);
  });
});
