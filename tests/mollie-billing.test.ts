import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import http from "http";
import type { AddressInfo } from "net";
import { eq } from "drizzle-orm";
import { addDays } from "date-fns";
import { getDb } from "@/db";
import { subscriptions } from "@/db/schema";
import { beginCheckout, cancelAtPeriodEnd, getBillingHistory, reactivateSubscription } from "@/lib/billing/subscription-service";
import { processBillingCycle } from "@/lib/billing/scheduler";
import { POST as webhook } from "@/app/api/webhooks/mollie/route";
import type { SessionPayload } from "@/lib/auth/session";
import { createMinimalOrg, truncateAll } from "./helpers/fixtures";
import { ensureMigrated } from "./helpers/migrate";

type FakePayment = Record<string, unknown> & { id: string; status: string };

/** Tiny stand-in for api.mollie.com so the real provider code runs end to end. */
function startFakeMollie() {
  const payments = new Map<string, FakePayment>();
  const calls: Array<{ method: string; path: string; body: Record<string, unknown> }> = [];
  let paymentSeq = 0;
  const server = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      const body = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      const path = req.url ?? "";
      calls.push({ method: req.method ?? "", path, body });
      const send = (status: number, json?: unknown) => {
        res.writeHead(status, { "Content-Type": "application/json" });
        res.end(json === undefined ? "" : JSON.stringify(json));
      };
      if (req.headers.authorization !== "Bearer test_fake_key") return send(401, { detail: "bad key" });
      if (req.method === "POST" && path === "/customers") return send(201, { id: "cst_fake1" });
      if (req.method === "POST" && path === "/payments") {
        const id = `tr_fake${++paymentSeq}`;
        const p = { id, status: "open", ...body, _links: { checkout: { href: `https://pay.example/checkout/${id}` } } } as FakePayment;
        payments.set(id, p);
        return send(201, p);
      }
      const get = path.match(/^\/payments\/(tr_\w+)$/);
      if (req.method === "GET" && get) {
        const p = payments.get(get[1]);
        return p ? send(200, p) : send(404, { detail: "not found" });
      }
      if (req.method === "POST" && /^\/customers\/cst_fake1\/subscriptions$/.test(path)) return send(201, { id: `sub_fake${calls.length}` });
      if (req.method === "DELETE" || req.method === "PATCH") return req.method === "DELETE" ? send(204) : send(200, {});
      return send(404, { detail: "unknown route" });
    });
  });
  return { server, payments, calls };
}

async function hook(id: string) {
  return webhook(new Request("http://localhost/api/webhooks/mollie", { method: "POST", body: `id=${id}`, headers: { "Content-Type": "application/x-www-form-urlencoded" } }));
}

describe("Mollie billing (against a fake Mollie API)", () => {
  const fake = startFakeMollie();
  let owner: SessionPayload;
  let orgId: string;

  beforeAll(async () => {
    await new Promise<void>((r) => fake.server.listen(0, "127.0.0.1", r));
    process.env.MOLLIE_API_URL = `http://127.0.0.1:${(fake.server.address() as AddressInfo).port}`;
    process.env.MOLLIE_API_KEY = "test_fake_key";
    process.env.CLEANPROOF_PAYMENT_PROVIDER = "mollie";
    process.env.APP_URL = "https://app.example.test";
    const { resetEnvCacheForTests } = await import("@/lib/env");
    resetEnvCacheForTests();
    await ensureMigrated();
  });

  afterAll(async () => {
    delete process.env.CLEANPROOF_PAYMENT_PROVIDER;
    delete process.env.MOLLIE_API_KEY;
    delete process.env.MOLLIE_API_URL;
    await new Promise((r) => fake.server.close(r));
  });

  beforeEach(async () => {
    await truncateAll();
    fake.calls.length = 0;
    fake.payments.clear();
    const f = await createMinimalOrg("Mollie");
    orgId = f.org.id;
    owner = { userId: f.owner.id, organizationId: f.org.id, role: "owner" };
  });

  async function activateGrowth() {
    const { checkoutUrl, checkoutSessionRef, simulated } = await beginCheckout(owner, "growth", `k-${Math.random()}`);
    expect(simulated).toBe(false);
    expect(checkoutUrl).toBe(`https://pay.example/checkout/${checkoutSessionRef}`);
    fake.payments.get(checkoutSessionRef)!.status = "paid";
    expect((await hook(checkoutSessionRef)).status).toBe(200);
    return checkoutSessionRef;
  }

  it("sends a first payment for the right amount and activates only after Mollie says paid", async () => {
    const { checkoutSessionRef } = await beginCheckout(owner, "growth", "idem-1");
    const created = fake.calls.find((c) => c.method === "POST" && c.path === "/payments")!;
    expect(created.body).toMatchObject({ sequenceType: "first", amount: { currency: "GBP", value: "39.00" }, webhookUrl: "https://app.example.test/api/webhooks/mollie" });

    await hook(checkoutSessionRef); // still open
    let [sub] = await getDb().select().from(subscriptions).where(eq(subscriptions.organizationId, orgId));
    expect(sub.status).toBe("trialing");

    fake.payments.get(checkoutSessionRef)!.status = "paid";
    await hook(checkoutSessionRef);
    [sub] = await getDb().select().from(subscriptions).where(eq(subscriptions.organizationId, orgId));
    expect(sub.status).toBe("active");
    expect(sub.plan).toBe("growth");
    expect(sub.mollieCustomerId).toBe("cst_fake1");
    expect(sub.mollieSubscriptionId).toMatch(/^sub_fake/);
    const recurring = fake.calls.find((c) => c.path === "/customers/cst_fake1/subscriptions")!;
    expect(recurring.body).toMatchObject({ interval: "1 month", amount: { currency: "GBP", value: "39.00" } });
    expect(new Date(String(recurring.body.startDate)).getTime()).toBeGreaterThan(Date.now());

    const history = await getBillingHistory(orgId);
    expect(history).toHaveLength(1);
    expect(history[0].simulated).toBe(false);
    expect(history[0].description).not.toContain("SIMULATED");
  });

  it("is idempotent when the same webhook arrives twice", async () => {
    const ref = await activateGrowth();
    await hook(ref);
    await hook(ref);
    expect(await getBillingHistory(orgId)).toHaveLength(1);
    expect(fake.calls.filter((c) => c.path === "/customers/cst_fake1/subscriptions" && c.method === "POST")).toHaveLength(1);
  });

  it("ignores webhook ids that Mollie does not know and malformed bodies", async () => {
    expect((await hook("tr_doesnotexist")).status).toBe(200);
    const bad = await webhook(new Request("http://localhost/x", { method: "POST", body: "id=../../etc" }));
    expect(bad.status).toBe(200);
    expect(await getBillingHistory(orgId)).toHaveLength(0);
  });

  it("extends the period on a paid renewal and marks past_due on a failed one", async () => {
    await activateGrowth();
    const [before] = await getDb().select().from(subscriptions).where(eq(subscriptions.organizationId, orgId));
    const subId = before.mollieSubscriptionId!;

    fake.payments.set("tr_rec1", { id: "tr_rec1", status: "paid", amount: { currency: "GBP", value: "39.00" }, customerId: "cst_fake1", subscriptionId: subId, sequenceType: "recurring" });
    await hook("tr_rec1");
    await hook("tr_rec1");
    const [after] = await getDb().select().from(subscriptions).where(eq(subscriptions.organizationId, orgId));
    expect(after.currentPeriodEnd!.getTime()).toBeGreaterThan(before.currentPeriodEnd!.getTime());
    expect(await getBillingHistory(orgId)).toHaveLength(2);

    fake.payments.set("tr_rec2", { id: "tr_rec2", status: "failed", amount: { currency: "GBP", value: "39.00" }, customerId: "cst_fake1", subscriptionId: subId, sequenceType: "recurring" });
    await hook("tr_rec2");
    const [failed] = await getDb().select().from(subscriptions).where(eq(subscriptions.organizationId, orgId));
    expect(failed.status).toBe("past_due");
  });

  it("never grants a free renewal: overdue real subscriptions go past_due instead", async () => {
    await activateGrowth();
    const db = getDb();
    await db.update(subscriptions).set({ currentPeriodEnd: addDays(new Date(), -10) }).where(eq(subscriptions.organizationId, orgId));
    const result = await processBillingCycle();
    expect(result.renewalsProcessed).toBe(0);
    expect(result.pastDueApplied).toBeGreaterThanOrEqual(1);
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.organizationId, orgId));
    expect(sub.status).toBe("past_due");
  });

  it("cancelling stops the Mollie subscription, and reactivating starts a new one", async () => {
    await activateGrowth();
    await cancelAtPeriodEnd(owner);
    expect(fake.calls.some((c) => c.method === "DELETE" && c.path.startsWith("/customers/cst_fake1/subscriptions/"))).toBe(true);
    let [sub] = await getDb().select().from(subscriptions).where(eq(subscriptions.organizationId, orgId));
    expect(sub.cancelAtPeriodEnd).toBe(true);
    expect(sub.mollieSubscriptionId).toBeNull();

    await reactivateSubscription(owner);
    [sub] = await getDb().select().from(subscriptions).where(eq(subscriptions.organizationId, orgId));
    expect(sub.cancelAtPeriodEnd).toBe(false);
    expect(sub.mollieSubscriptionId).toMatch(/^sub_fake/);
  });
});
