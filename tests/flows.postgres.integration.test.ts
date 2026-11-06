import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { closeDb } from "@/db";
import { approveJob, createOrganizationWithOwner, startJob } from "@/lib/db/mutations";
import { submitJobChecklistFromForm } from "@/lib/jobs/submit-form";
import { seedBeforeAfterEvidence } from "./helpers/evidence";
import type { SessionPayload } from "@/lib/auth/session";
import { getJobForSession, getMembershipForUser, getReportByToken } from "@/lib/db/queries";
import { assertRealPostgresConfigured, describeRealPostgres } from "./helpers/postgres-real";
import { createMinimalOrg, truncateAll } from "./helpers/fixtures";
import { ensureMigrated } from "./helpers/migrate";

const pgProbe = await describeRealPostgres();
const describePg = pgProbe.available ? describe : describe.skip;

describePg(`role flows on real PostgreSQL (${pgProbe.reason})`, () => {
  beforeAll(async () => {
    process.env.USE_PGLITE = "false";
    process.env.DATABASE_URL = assertRealPostgresConfigured();
    const { getEnv, resetEnvCacheForTests } = await import("@/lib/env");
    resetEnvCacheForTests();
    getEnv();
    await ensureMigrated();
  });

  beforeEach(async () => {
    await truncateAll();
  });

  it("signup creates organisation, owner membership, and subscription", async () => {
    const passwordHash = await bcrypt.hash("password12345", 12);
    const { org, user } = await createOrganizationWithOwner({
      company: "Flow Test Co",
      name: "Owner Person",
      email: `flow-owner-${Date.now()}@test.cleanproof`,
      passwordHash,
    });
    const membership = await getMembershipForUser(user.id, org.id);
    expect(membership?.role).toBe("owner");
    expect(membership?.organization.id).toBe(org.id);
  });

  it("assigned worker submits checklist and manager approves", async () => {
    const fixture = await createMinimalOrg("FlowOrg");
    const workerSession: SessionPayload = {
      userId: fixture.cleaner.id,
      organizationId: fixture.org.id,
      role: "cleaner",
    };
    const managerSession: SessionPayload = {
      userId: fixture.owner.id,
      organizationId: fixture.org.id,
      role: "owner",
    };

    await startJob(fixture.job.id, workerSession);
    await seedBeforeAfterEvidence({ session: workerSession, jobId: fixture.job.id });
    const fd = new FormData();
    const bundle = await getJobForSession(fixture.job.id, workerSession);
    for (const item of bundle?.template?.items ?? []) {
      fd.set(`item_${item.id}`, "pass");
    }
    await submitJobChecklistFromForm(fixture.job.id, workerSession, fd);
    await approveJob(fixture.job.id, managerSession);
    const approved = await getJobForSession(fixture.job.id, managerSession);
    expect(approved?.job.status).toBe("approved");
  });

  it("client report token resolves for seeded share", async () => {
    const fixture = await createMinimalOrg("ReportOrg");
    const managerSession: SessionPayload = {
      userId: fixture.owner.id,
      organizationId: fixture.org.id,
      role: "owner",
    };
    const workerSession: SessionPayload = {
      userId: fixture.cleaner.id,
      organizationId: fixture.org.id,
      role: "cleaner",
    };
    await seedBeforeAfterEvidence({ session: workerSession, jobId: fixture.job.id });
    await submitJobChecklistFromForm(fixture.job.id, workerSession, new FormData());
    await approveJob(fixture.job.id, managerSession);
    const report = await getReportByToken("ReportOrg-report-token");
    expect(report?.job.id).toBe(fixture.job.id);
  });
});

afterAll(async () => {
  await closeDb();
});
