import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { buildInternalReportPdf } from "@/lib/reports/pdf-access";
import { approveJobReview } from "@/lib/quality/review-service";
import { submitJobChecklistPayload } from "@/lib/jobs/submit-payload";
import { notifyEvent } from "@/lib/notifications/service";
import { NOTIFICATION_EVENTS } from "@/lib/notifications/types";
import { escapeCsvField, sanitizeCsvCell } from "@/lib/csv/sanitize";
import { parseClientsCsv, importClientsConfirmed } from "@/lib/csv/import-clients";
import { getDb } from "@/db";
import { emailOutbox } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { SessionPayload } from "@/lib/auth/session";
import { startJob } from "@/lib/db/mutations";
import { createMinimalOrg, truncateAll } from "./helpers/fixtures";
import { seedBeforeAfterEvidence } from "./helpers/evidence";
import { ensureMigrated } from "./helpers/migrate";

describe("phase 4 pdf, email, csv", () => {
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

  it("blocks PDF for unapproved jobs", async () => {
    const fixture = await createMinimalOrg("PdfBlock");
    await expect(
      buildInternalReportPdf(fixture.org.id, fixture.job.id, false),
    ).rejects.toThrow();
  });

  it("generates PDF bytes for approved jobs", async () => {
    const fixture = await createMinimalOrg("PdfOk");
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
      idempotencyKey: "p4-sub",
      items: [],
    });
    await approveJobReview(manager, { jobId: fixture.job.id, idempotencyKey: "p4-appr" });
    const pdf = await buildInternalReportPdf(fixture.org.id, fixture.job.id, false);
    expect(pdf.length).toBeGreaterThan(500);
    expect(Buffer.from(pdf).subarray(0, 4).toString()).toBe("%PDF");
  });

  it("deduplicates email outbox by idempotency key", async () => {
    const fixture = await createMinimalOrg("Email");
    await notifyEvent({
      organizationId: fixture.org.id,
      eventType: NOTIFICATION_EVENTS.jobSubmitted,
      idempotencyKey: "idem-1",
      recipientUserIds: [fixture.owner.id],
      title: "Test",
      body: "Body",
      emailSubject: "Subject",
      emailHtml: "<p>Hi</p>",
      emailText: "Hi",
    });
    await notifyEvent({
      organizationId: fixture.org.id,
      eventType: NOTIFICATION_EVENTS.jobSubmitted,
      idempotencyKey: "idem-1",
      recipientUserIds: [fixture.owner.id],
      title: "Test",
      body: "Body",
      emailSubject: "Subject",
      emailHtml: "<p>Hi</p>",
      emailText: "Hi",
    });
    const db = getDb();
    const rows = await db.select().from(emailOutbox).where(eq(emailOutbox.organizationId, fixture.org.id));
    expect(rows.length).toBe(1);
  });

  it("sanitizes CSV formula injection", () => {
    expect(sanitizeCsvCell("=SUM(A1)")).toBe("'=SUM(A1)");
    expect(escapeCsvField("hello")).toBe("hello");
  });

  it("imports valid client rows", async () => {
    const fixture = await createMinimalOrg("Import");
    const csv = "display_name,contact_email\nAcme Ltd,owner@acme.test\n";
    const rows = parseClientsCsv(csv);
    const result = await importClientsConfirmed(fixture.org.id, fixture.owner.id, rows);
    expect(result.success).toBe(1);
    expect(result.failed).toBe(0);
  });
});
