import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { paymentAttempts } from "@/db/schema";
import { isMockBillingAllowed } from "@/lib/billing/guards";
import type {
  CheckoutSessionInput,
  CheckoutSessionResult,
  PaymentProvider,
  ProviderEvent,
  ProviderPayment,
  ProviderSubscription,
} from "@/lib/payments/types";

type MockSession = {
  organizationId: string;
  planId: string;
  amountMinor: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "canceled" | "expired";
  failureReason?: string;
  subscriptionRef?: string;
};

type MockPaymentGlobal = {
  __cleanproofMockCheckoutSessions?: Map<string, MockSession>;
  __cleanproofMockSubscriptions?: Map<string, ProviderSubscription>;
  __cleanproofMockPaymentProvider?: MockPaymentProvider;
};

const mockGlobal = globalThis as typeof globalThis & MockPaymentGlobal;

function checkoutSessions(): Map<string, MockSession> {
  if (!mockGlobal.__cleanproofMockCheckoutSessions) {
    mockGlobal.__cleanproofMockCheckoutSessions = new Map();
  }
  return mockGlobal.__cleanproofMockCheckoutSessions;
}

function mockSubscriptions(): Map<string, ProviderSubscription> {
  if (!mockGlobal.__cleanproofMockSubscriptions) {
    mockGlobal.__cleanproofMockSubscriptions = new Map();
  }
  return mockGlobal.__cleanproofMockSubscriptions;
}

function mapAttemptStatus(status: string): MockSession["status"] {
  if (status === "paid" || status === "success") return "paid";
  if (status === "failed") return "failed";
  if (status === "canceled") return "canceled";
  if (status === "expired") return "expired";
  return "pending";
}

export class MockPaymentProvider implements PaymentProvider {
  id = "mock" as const;
  simulated = true;

  private ensureDev() {
    if (!isMockBillingAllowed()) {
      throw new Error("Mock payment provider is disabled in production.");
    }
  }

  async createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
    this.ensureDev();
    const checkoutSessionRef = `mock_cs_${randomUUID()}`;
    checkoutSessions().set(checkoutSessionRef, {
      organizationId: input.organizationId,
      planId: input.planId,
      amountMinor: input.amountMinor,
      currency: input.currency,
      status: "pending",
    });
    const base = process.env.APP_URL ?? "http://localhost:3000";
    const checkoutUrl = `${base}/app/settings/billing/checkout?session=${encodeURIComponent(checkoutSessionRef)}`;
    return {
      provider: "mock",
      checkoutSessionRef,
      checkoutUrl,
      simulated: true,
    };
  }

  async hydrateCheckoutSession(checkoutSessionRef: string): Promise<void> {
    this.ensureDev();
    if (checkoutSessions().has(checkoutSessionRef)) return;
    const db = getDb();
    const [attempt] = await db
      .select()
      .from(paymentAttempts)
      .where(eq(paymentAttempts.checkoutSessionRef, checkoutSessionRef))
      .limit(1);
    if (!attempt) return;
    checkoutSessions().set(checkoutSessionRef, {
      organizationId: attempt.organizationId,
      planId: attempt.planId,
      amountMinor: attempt.amountMinor,
      currency: attempt.currency,
      status: mapAttemptStatus(attempt.status),
      failureReason: attempt.failureReason ?? undefined,
    });
  }

  async retrievePayment(checkoutSessionRef: string): Promise<ProviderPayment | null> {
    this.ensureDev();
    await this.hydrateCheckoutSession(checkoutSessionRef);
    const s = checkoutSessions().get(checkoutSessionRef);
    if (!s) return null;
    return {
      checkoutSessionRef,
      status: s.status === "pending" ? "pending" : s.status,
      amountMinor: s.amountMinor,
      currency: s.currency,
      failureReason: s.failureReason,
    };
  }

  /** Development-only: set outcome for a pending session. */
  async simulateCheckoutOutcome(
    checkoutSessionRef: string,
    outcome: "success" | "failure" | "canceled" | "expired",
    failureReason?: string,
  ) {
    this.ensureDev();
    let s = checkoutSessions().get(checkoutSessionRef);
    if (!s) {
      await this.hydrateCheckoutSession(checkoutSessionRef);
      s = checkoutSessions().get(checkoutSessionRef);
    }
    if (!s) throw new Error("Unknown checkout session");
    if (outcome === "success") {
      s.status = "paid";
      const subRef = `mock_sub_${randomUUID()}`;
      s.subscriptionRef = subRef;
      mockSubscriptions().set(subRef, {
        externalRef: subRef,
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
      });
    } else if (outcome === "failure") {
      s.status = "failed";
      s.failureReason = failureReason ?? "Simulated payment failure";
    } else if (outcome === "canceled") {
      s.status = "canceled";
    } else {
      s.status = "expired";
    }
  }

  simulateRenewal(externalRef: string, success: boolean) {
    this.ensureDev();
    const sub = mockSubscriptions().get(externalRef);
    if (!sub) throw new Error("Unknown subscription");
    if (success) {
      sub.status = "active";
      sub.currentPeriodEnd = new Date(Date.now() + 30 * 86400000);
    } else {
      sub.status = "past_due";
    }
  }

  async retrieveSubscription(externalRef: string): Promise<ProviderSubscription | null> {
    this.ensureDev();
    return mockSubscriptions().get(externalRef) ?? null;
  }

  async cancelSubscription(externalRef: string): Promise<void> {
    this.ensureDev();
    const sub = mockSubscriptions().get(externalRef);
    if (sub) sub.status = "canceled";
  }

  async handleProviderEvent(event: ProviderEvent): Promise<{ handled: boolean; checkoutSessionRef?: string }> {
    this.ensureDev();
    if (event.checkoutSessionRef) {
      return { handled: true, checkoutSessionRef: event.checkoutSessionRef };
    }
    return { handled: false };
  }

  async getCustomerBillingReference(): Promise<string | null> {
    this.ensureDev();
    return null;
  }

  getSessionPlan(checkoutSessionRef: string): { organizationId: string; planId: string } | null {
    const s = checkoutSessions().get(checkoutSessionRef);
    if (!s) return null;
    return { organizationId: s.organizationId, planId: s.planId };
  }

  /** Sync hydrate for server components (call after hydrateCheckoutSession in async pages). */
  getSessionPlanFromMemory(checkoutSessionRef: string) {
    return this.getSessionPlan(checkoutSessionRef);
  }

  getSessionSubscriptionRef(checkoutSessionRef: string): string | undefined {
    return checkoutSessions().get(checkoutSessionRef)?.subscriptionRef;
  }
}

export function getMockPaymentProvider(): MockPaymentProvider {
  if (!mockGlobal.__cleanproofMockPaymentProvider) {
    mockGlobal.__cleanproofMockPaymentProvider = new MockPaymentProvider();
  }
  return mockGlobal.__cleanproofMockPaymentProvider;
}
