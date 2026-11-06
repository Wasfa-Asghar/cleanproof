import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { jobs, subscriptions } from "@/db/schema";
import { createOrganizationWithOwner } from "@/lib/db/mutations";
import { getEntitlementSnapshot, assertBillableAction } from "@/lib/billing/entitlements";
import {
  beginCheckout,
  completeMockCheckout,
  cancelAtPeriodEnd,
  reactivateSubscription,
  schedulePlanChange,
} from "@/lib/billing/subscription-service";
import { processBillingCycle } from "@/lib/billing/scheduler";
import { TRIAL_DAYS } from "@/lib/billing/plans";
import { createJobForOrg } from "@/lib/jobs/create-job";
import { isMockBillingAllowed } from "@/lib/billing/guards";
import { shouldUsePglite } from "@/db/index";
import type { SessionPayload } from "@/lib/auth/session";
import { createMinimalOrg, truncateAll } from "./helpers/fixtures";
import { ensureMigrated } from "./helpers/migrate";
import { addDays } from "date-fns";

describe("phase 5 billing and entitlements", () => {
  beforeAll(async () => {
    process.env.APP_URL = "http://localhost:3000";
    const { resetEnvCacheForTests } = await import("@/lib/env");
    resetEnvCacheForTests();
    await ensureMigrated();
  });

  beforeEach(async () => {
    await truncateAll();
  });

  it("starts 14-day trial on organisation signup", async () => {
    const { org } = await createOrganizationWithOwner({
      company: "Trial Co",
      name: "Owner",
      email: "trial-owner@test.cleanproof",
      passwordHash: "hash",
    });
    const snap = await getEntitlementSnapshot(org.id);
    expect(snap.status).toBe("trialing");
    expect(snap.trialDaysRemaining).toBeGreaterThanOrEqual(TRIAL_DAYS - 1);
    expect(snap.access).toBe("full");
  });

  it("activates subscription via mock checkout and records simulated transaction", async () => {
    const fixture = await createMinimalOrg("Pay");
    const owner: SessionPayload = {
      userId: fixture.owner.id,
      organizationId: fixture.org.id,
      role: "owner",
    };
    const { checkoutSessionRef } = await beginCheckout(owner, "growth", "idem-growth-1");
    expect(checkoutSessionRef).toMatch(/^mock_cs_/);
    await completeMockCheckout(owner, checkoutSessionRef, "success");
    const snap = await getEntitlementSnapshot(fixture.org.id);
    expect(snap.status).toBe("active");
    expect(snap.planId).toBe("growth");
    const history = await import("@/lib/billing/subscription-service").then((m) =>
      m.getBillingHistory(fixture.org.id),
    );
    expect(history.length).toBe(1);
    expect(history[0].simulated).toBe(true);
    expect(history[0].description).toContain("SIMULATED");
  });

  it("enforces job limits server-side", async () => {
    const fixture = await createMinimalOrg("Limit");
    const db = getDb();
    await db
      .update(subscriptions)
      .set({
        status: "active",
        plan: "starter",
        currentPeriodStart: new Date(Date.now() - 86400000),
        currentPeriodEnd: addDays(new Date(), 29),
      })
      .where(eq(subscriptions.organizationId, fixture.org.id));

    const owner: SessionPayload = {
      userId: fixture.owner.id,
      organizationId: fixture.org.id,
      role: "owner",
    };

    for (let i = 0; i < 99; i++) {
      await db.insert(jobs).values({
        organizationId: fixture.org.id,
        siteId: fixture.site.id,
        templateVersionId: fixture.templateVersionId,
        title: `Bulk ${i}`,
        startAt: new Date(),
        status: "assigned",
        assignedUserId: fixture.cleaner.id,
      });
    }

    await expect(
      createJobForOrg(owner, {
        siteId: fixture.site.id,
        title: "Over limit",
        startAt: new Date(),
        assignedUserId: fixture.cleaner.id,
      }),
    ).rejects.toThrow(/Job limit/);
  });

  it("schedules cancellation and reactivation", async () => {
    const fixture = await createMinimalOrg("Cancel");
    const owner: SessionPayload = {
      userId: fixture.owner.id,
      organizationId: fixture.org.id,
      role: "owner",
    };
    await cancelAtPeriodEnd(owner);
    let snap = await getEntitlementSnapshot(fixture.org.id);
    expect(snap.cancelAtPeriodEnd).toBe(true);
    await reactivateSubscription(owner);
    snap = await getEntitlementSnapshot(fixture.org.id);
    expect(snap.cancelAtPeriodEnd).toBe(false);
  });

  it("expires trial via billing processor", async () => {
    const fixture = await createMinimalOrg("Expire");
    const db = getDb();
    await db
      .update(subscriptions)
      .set({
        trialEndsAt: new Date(Date.now() - 1000),
        trialStartsAt: addDays(new Date(), -15),
      })
      .where(eq(subscriptions.organizationId, fixture.org.id));

    const result = await processBillingCycle(new Date());
    expect(result.trialsExpired).toBeGreaterThanOrEqual(1);

    await expect(assertBillableAction(fixture.org.id, "create_job")).rejects.toThrow(/billable operations/i);
  });

  it("blocks mock billing in production deployment", () => {
    vi.stubEnv("CLEANPROOF_DEPLOYMENT", "production");
    vi.stubEnv("NODE_ENV", "production");
    expect(isMockBillingAllowed()).toBe(false);
    vi.unstubAllEnvs();
  });

  it("never auto-selects PGlite in production", () => {
    vi.stubEnv("CLEANPROOF_DEPLOYMENT", "production");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("USE_PGLITE", "");
    expect(shouldUsePglite()).toBe(false);
    vi.unstubAllEnvs();
  });

  it("isolates billing checkout to owning organisation", async () => {
    const a = await createMinimalOrg("OrgA");
    const b = await createMinimalOrg("OrgB");
    const ownerB: SessionPayload = {
      userId: b.owner.id,
      organizationId: b.org.id,
      role: "owner",
    };
    const ownerA: SessionPayload = {
      userId: a.owner.id,
      organizationId: a.org.id,
      role: "owner",
    };
    const { checkoutSessionRef } = await beginCheckout(ownerA, "growth", "idem-a");
    await expect(completeMockCheckout(ownerB, checkoutSessionRef, "success")).rejects.toThrow();
  });

  it("idempotent checkout completion does not double-charge", async () => {
    const fixture = await createMinimalOrg("Idem");
    const owner: SessionPayload = {
      userId: fixture.owner.id,
      organizationId: fixture.org.id,
      role: "owner",
    };
    const { checkoutSessionRef } = await beginCheckout(owner, "starter", "idem-starter");
    await completeMockCheckout(owner, checkoutSessionRef, "success");
    await completeMockCheckout(owner, checkoutSessionRef, "success");
    const history = await import("@/lib/billing/subscription-service").then((m) =>
      m.getBillingHistory(fixture.org.id),
    );
    expect(history.length).toBe(1);
  });

  it("upgrade uses checkout; downgrade schedules after paid plan", async () => {
    const fixture = await createMinimalOrg("Change");
    const owner: SessionPayload = {
      userId: fixture.owner.id,
      organizationId: fixture.org.id,
      role: "owner",
    };
    const up = await schedulePlanChange(owner, "pro");
    expect("checkoutUrl" in up).toBe(true);
    const { checkoutSessionRef } = await beginCheckout(owner, "pro", "idem-pro");
    await completeMockCheckout(owner, checkoutSessionRef, "success");
    const down = await schedulePlanChange(owner, "growth");
    expect("scheduled" in down).toBe(true);
  });
});
