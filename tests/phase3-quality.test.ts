import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { SessionPayload } from "@/lib/auth/session";
import { approveJobReview, rejectJobReview, requestClarificationReview } from "@/lib/quality/review-service";
import { findActiveRecleanJob } from "@/lib/quality/reclean-service";
import { submitJobChecklistPayload } from "@/lib/jobs/submit-payload";
import { getJobForOrganization } from "@/lib/db/queries";
import { createReportShare } from "@/lib/reports/share-service";
import { createCustomerComplaint } from "@/lib/issues/service";
import { getPhase3Metrics } from "@/lib/analytics/metrics";
import { startJob } from "@/lib/db/mutations";
import { createMinimalOrg, truncateAll } from "./helpers/fixtures";
import { seedBeforeAfterEvidence } from "./helpers/evidence";
import { ensureMigrated } from "./helpers/migrate";

describe("phase 3 quality & issues", () => {
  beforeAll(async () => {
    const { getEnv } = await import("@/lib/env");
    getEnv();
    await ensureMigrated();
  });

  beforeEach(async () => {
    await truncateAll();
  });

  it("blocks self-approval", async () => {
    const fixture = await createMinimalOrg("Self");
    const cleaner: SessionPayload = {
      userId: fixture.cleaner.id,
      organizationId: fixture.org.id,
      role: "cleaner",
    };
    await seedBeforeAfterEvidence({ session: cleaner, jobId: fixture.job.id });
    await submitJobChecklistPayload(cleaner, {
      jobId: fixture.job.id,
      idempotencyKey: "sub-self",
      items: [],
    });
    await expect(
      approveJobReview(cleaner, { jobId: fixture.job.id, idempotencyKey: "a1" }),
    ).rejects.toThrow();
  });

  it("approves submitted work and records idempotent review", async () => {
    const fixture = await createMinimalOrg("Approve");
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
      idempotencyKey: "sub-1",
      items: [],
    });
    const pending = await getJobForOrganization(fixture.job.id, fixture.org.id);
    expect(pending?.status).toBe("needs_review");
    await approveJobReview(manager, { jobId: fixture.job.id, idempotencyKey: "rev-1" });
    const dup = await approveJobReview(manager, { jobId: fixture.job.id, idempotencyKey: "rev-1" });
    expect(dup.duplicate).toBe(true);
    const job = await getJobForOrganization(fixture.job.id, fixture.org.id);
    expect(job?.status).toBe("approved");
  });

  it("rejects work once and reuses active re-clean job", async () => {
    const fixture = await createMinimalOrg("Reject");
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
      idempotencyKey: "sub-r",
      items: [],
    });
    const first = await rejectJobReview(manager, {
      jobId: fixture.job.id,
      idempotencyKey: "rej-1",
      reason: "Missed kitchen",
      assigneeId: fixture.cleaner.id,
    });
    const second = await rejectJobReview(manager, {
      jobId: fixture.job.id,
      idempotencyKey: "rej-1",
      reason: "Missed kitchen",
      assigneeId: fixture.cleaner.id,
    });
    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);
    const active = await findActiveRecleanJob(fixture.org.id, fixture.job.id);
    expect(active?.jobKind).toBe("reclean");
  });

  it("requires clarification reason", async () => {
    const fixture = await createMinimalOrg("Clarify");
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
    await seedBeforeAfterEvidence({ session: cleaner, jobId: fixture.job.id });
    await submitJobChecklistPayload(cleaner, {
      jobId: fixture.job.id,
      idempotencyKey: "sub-c",
      items: [],
    });
    await expect(
      requestClarificationReview(manager, {
        jobId: fixture.job.id,
        idempotencyKey: "c1",
        reason: "  ",
      }),
    ).rejects.toThrow();
  });

  it("creates report share only for approved jobs", async () => {
    const fixture = await createMinimalOrg("Report");
    const manager: SessionPayload = {
      userId: fixture.owner.id,
      organizationId: fixture.org.id,
      role: "owner",
    };
    await expect(createReportShare(manager, { jobId: fixture.job.id })).rejects.toThrow();
  });

  it("tracks complaints in dashboard metrics", async () => {
    const fixture = await createMinimalOrg("Metrics");
    const manager: SessionPayload = {
      userId: fixture.owner.id,
      organizationId: fixture.org.id,
      role: "owner",
    };
    await createCustomerComplaint(manager, {
      jobId: fixture.job.id,
      description: "Late arrival",
      severity: "medium",
    });
    const metrics = await getPhase3Metrics(fixture.org.id);
    expect(metrics.openComplaints).toBeGreaterThan(0);
  });
});
