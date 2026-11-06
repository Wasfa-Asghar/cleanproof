import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { closeDb } from "@/db";
import {
  approveJob,
  cancelSubscription,
} from "@/lib/db/mutations";
import {
  getEvidenceForOrganization,
  getIssueForOrganization,
  getJobForOrganization,
  getJobForSession,
  getMembershipForOrganization,
  getReportShareForOrganization,
  getSiteForOrganization,
  getSubscriptionForOrg,
  getTemplateBundleByVersionId,
  listJobsForOrg,
} from "@/lib/db/queries";
import type { SessionPayload } from "@/lib/auth/session";
import { createMinimalOrg, truncateAll } from "./helpers/fixtures";
import { ensureMigrated } from "./helpers/migrate";

describe("tenant isolation", () => {
  beforeAll(async () => {
    const { getEnv } = await import("@/lib/env");
    getEnv();
    await ensureMigrated();
  });

  beforeEach(async () => {
    await truncateAll();
  });

  it("does not return another organisation's job via getJobForSession", async () => {
    const a = await createMinimalOrg("Alpha");
    const b = await createMinimalOrg("Beta");

    const sessionA: SessionPayload = {
      userId: a.owner.id,
      organizationId: a.org.id,
      role: "owner",
    };

    const cross = await getJobForSession(b.job.id, sessionA);
    expect(cross).toBeUndefined();

    const own = await getJobForSession(a.job.id, sessionA);
    expect(own?.job.id).toBe(a.job.id);
  });

  it("getJobForOrganization rejects cross-tenant lookup", async () => {
    const a = await createMinimalOrg("Alpha");
    const b = await createMinimalOrg("Beta");
    const job = await getJobForOrganization(b.job.id, a.org.id);
    expect(job).toBeUndefined();
  });

  it("does not return another organisation's site", async () => {
    const a = await createMinimalOrg("Alpha");
    const b = await createMinimalOrg("Beta");
    const site = await getSiteForOrganization(b.site.id, a.org.id);
    expect(site).toBeUndefined();
  });

  it("listJobsForOrg only includes tenant jobs", async () => {
    const a = await createMinimalOrg("Alpha");
    const b = await createMinimalOrg("Beta");
    const jobsA = await listJobsForOrg(a.org.id);
    expect(jobsA.every((j) => j.organizationId === a.org.id)).toBe(true);
    expect(jobsA.some((j) => j.id === b.job.id)).toBe(false);
  });

  it("approveJob cannot modify another tenant job", async () => {
    const a = await createMinimalOrg("Alpha");
    const b = await createMinimalOrg("Beta");
    const sessionA: SessionPayload = {
      userId: a.owner.id,
      organizationId: a.org.id,
      role: "owner",
    };
    await expect(approveJob(b.job.id, sessionA)).rejects.toThrow();
    const still = await getJobForOrganization(b.job.id, b.org.id);
    expect(still?.status).toBe("assigned");
  });

  it("subscription reads are scoped per organisation", async () => {
    const a = await createMinimalOrg("Alpha");
    const b = await createMinimalOrg("Beta");
    const subA = await getSubscriptionForOrg(a.org.id);
    const subB = await getSubscriptionForOrg(b.org.id);
    expect(subA?.organizationId).toBe(a.org.id);
    expect(subB?.organizationId).toBe(b.org.id);
    expect(subA?.id).not.toBe(subB?.id);
  });

  it("does not expose another organisation's evidence, issues, reports, templates, or team rows", async () => {
    const a = await createMinimalOrg("Alpha");
    const b = await createMinimalOrg("Beta");

    expect(await getEvidenceForOrganization(b.ev!.id, a.org.id)).toBeUndefined();
    expect(await getIssueForOrganization(b.issue!.id, a.org.id)).toBeUndefined();
    expect(await getReportShareForOrganization(b.share!.id, a.org.id)).toBeUndefined();
    expect(await getMembershipForOrganization(b.membership!.id, a.org.id)).toBeUndefined();
    expect(await getTemplateBundleByVersionId(b.templateVersionId, a.org.id)).toBeUndefined();
  });

  it("cancelSubscription only affects the session organisation", async () => {
    const a = await createMinimalOrg("Alpha");
    const b = await createMinimalOrg("Beta");
    const sessionA: SessionPayload = {
      userId: a.owner.id,
      organizationId: a.org.id,
      role: "owner",
    };
    await cancelSubscription(sessionA);
    const subA = await getSubscriptionForOrg(a.org.id);
    const subB = await getSubscriptionForOrg(b.org.id);
    expect(subA?.cancelAtPeriodEnd).toBe(true);
    expect(subB?.cancelAtPeriodEnd).not.toBe(true);
    expect(subB?.status).toBe("trialing");
  });
});

afterAll(async () => {
  await closeDb();
});
