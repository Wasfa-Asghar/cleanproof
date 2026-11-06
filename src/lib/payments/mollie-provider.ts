import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { subscriptions } from "@/db/schema";
import type {
  CheckoutSessionInput,
  CheckoutSessionResult,
  PaymentProvider,
  ProviderEvent,
  ProviderPayment,
  ProviderPaymentStatus,
  ProviderSubscription,
  RecurringSubscriptionInput,
} from "@/lib/payments/types";

export function mollieApiBase(): string {
  return (process.env.MOLLIE_API_URL ?? "https://api.mollie.com/v2").replace(/\/$/, "");
}

export function isMollieConfigured(): boolean {
  return Boolean(process.env.MOLLIE_API_KEY?.trim());
}

export class MollieApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "MollieApiError";
  }
}

type MollieAmount = { currency: string; value: string };

type MolliePayment = {
  id: string;
  status: string;
  amount: MollieAmount;
  customerId?: string;
  subscriptionId?: string;
  sequenceType?: "oneoff" | "first" | "recurring";
  metadata?: Record<string, unknown> | null;
  details?: { failureReason?: string } | null;
  _links?: { checkout?: { href: string } };
};

export type MolliePaymentDetails = {
  id: string;
  status: ProviderPaymentStatus;
  amountMinor: number;
  currency: string;
  customerId?: string;
  subscriptionId?: string;
  sequenceType?: "oneoff" | "first" | "recurring";
  metadata: Record<string, unknown>;
  failureReason?: string;
};

export function toMollieValue(amountMinor: number): string {
  return (amountMinor / 100).toFixed(2);
}

export function fromMollieValue(value: string): number {
  return Math.round(Number.parseFloat(value) * 100);
}

export function mapMollieStatus(status: string): ProviderPaymentStatus {
  switch (status) {
    case "paid":
      return "paid";
    case "failed":
      return "failed";
    case "canceled":
      return "canceled";
    case "expired":
      return "expired";
    default:
      return "pending"; // open, pending, authorized
  }
}

/** Mollie rejects webhook URLs it cannot reach, so only send one for a public https address. */
export function webhookUrlForApp(): string | undefined {
  const base = (process.env.APP_URL ?? "").replace(/\/$/, "");
  if (!base.startsWith("https://")) return undefined;
  if (/localhost|127\.0\.0\.1|\[::1\]/.test(base)) return undefined;
  return `${base}/api/webhooks/mollie`;
}

async function mollieRequest<T>(method: "GET" | "POST" | "PATCH" | "DELETE", path: string, body?: unknown): Promise<T> {
  const key = process.env.MOLLIE_API_KEY?.trim();
  if (!key) throw new MollieApiError("MOLLIE_API_KEY is not set.", 500);
  const res = await fetch(`${mollieApiBase()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  let json: unknown = undefined;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    json = undefined;
  }
  if (!res.ok) {
    const detail = (json as { detail?: string; title?: string } | undefined)?.detail ?? (json as { title?: string } | undefined)?.title;
    throw new MollieApiError(detail ?? `Mollie request failed (${res.status}).`, res.status);
  }
  return json as T;
}

function toDetails(p: MolliePayment): MolliePaymentDetails {
  return {
    id: p.id,
    status: mapMollieStatus(p.status),
    amountMinor: fromMollieValue(p.amount.value),
    currency: p.amount.currency,
    customerId: p.customerId,
    subscriptionId: p.subscriptionId,
    sequenceType: p.sequenceType,
    metadata: (p.metadata ?? {}) as Record<string, unknown>,
    failureReason: p.details?.failureReason,
  };
}

export class MolliePaymentProvider implements PaymentProvider {
  id = "mollie" as const;
  simulated = false;

  private async ensureCustomer(input: CheckoutSessionInput): Promise<string> {
    const db = getDb();
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.organizationId, input.organizationId)).limit(1);
    if (sub?.mollieCustomerId) return sub.mollieCustomerId;
    const customer = await mollieRequest<{ id: string }>("POST", "/customers", {
      name: input.customerName ?? undefined,
      email: input.customerEmail ?? undefined,
      metadata: { organizationId: input.organizationId },
    });
    await db
      .update(subscriptions)
      .set({ mollieCustomerId: customer.id, providerCustomerRef: customer.id, updatedAt: new Date() })
      .where(eq(subscriptions.organizationId, input.organizationId));
    return customer.id;
  }

  async createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
    const customerId = await this.ensureCustomer(input);
    const webhookUrl = webhookUrlForApp();
    const payment = await mollieRequest<MolliePayment>("POST", "/payments", {
      amount: { currency: input.currency, value: toMollieValue(input.amountMinor) },
      description: `CleanProof ${input.planId} plan, first month`,
      redirectUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      ...(webhookUrl ? { webhookUrl } : {}),
      customerId,
      sequenceType: "first",
      locale: "en_GB",
      metadata: {
        organizationId: input.organizationId,
        planId: input.planId,
        idempotencyKey: input.idempotencyKey,
      },
    });
    const checkoutUrl = payment._links?.checkout?.href;
    if (!checkoutUrl) throw new MollieApiError("Mollie did not return a checkout link.", 502);
    return { provider: "mollie", checkoutSessionRef: payment.id, checkoutUrl, simulated: false };
  }

  async getPaymentDetails(paymentId: string): Promise<MolliePaymentDetails | null> {
    try {
      return toDetails(await mollieRequest<MolliePayment>("GET", `/payments/${encodeURIComponent(paymentId)}`));
    } catch (err) {
      if (err instanceof MollieApiError && err.status === 404) return null;
      throw err;
    }
  }

  async retrievePayment(checkoutSessionRef: string): Promise<ProviderPayment | null> {
    const d = await this.getPaymentDetails(checkoutSessionRef);
    if (!d) return null;
    return {
      checkoutSessionRef,
      status: d.status,
      amountMinor: d.amountMinor,
      currency: d.currency,
      failureReason: d.failureReason,
    };
  }

  /** `externalRef` is `customerId:subscriptionId`. */
  async retrieveSubscription(externalRef: string): Promise<ProviderSubscription | null> {
    const [customerId, subscriptionId] = externalRef.split(":");
    if (!customerId || !subscriptionId) return null;
    try {
      const s = await mollieRequest<{ id: string; status: string; nextPaymentDate?: string }>(
        "GET",
        `/customers/${customerId}/subscriptions/${subscriptionId}`,
      );
      return {
        externalRef,
        status: s.status === "active" ? "active" : s.status === "canceled" ? "canceled" : "expired",
        currentPeriodEnd: s.nextPaymentDate ? new Date(s.nextPaymentDate) : undefined,
      };
    } catch (err) {
      if (err instanceof MollieApiError && err.status === 404) return null;
      throw err;
    }
  }

  async cancelSubscription(externalRef: string): Promise<void> {
    const [customerId, subscriptionId] = externalRef.split(":");
    if (!customerId || !subscriptionId) return;
    await this.cancelRecurringSubscription(customerId, subscriptionId);
  }

  async createRecurringSubscription(input: RecurringSubscriptionInput): Promise<{ subscriptionId: string }> {
    const webhookUrl = webhookUrlForApp();
    const s = await mollieRequest<{ id: string }>("POST", `/customers/${input.customerId}/subscriptions`, {
      amount: { currency: input.currency, value: toMollieValue(input.amountMinor) },
      interval: "1 month",
      startDate: input.startDate,
      description: `CleanProof ${input.planId} plan`,
      ...(webhookUrl ? { webhookUrl } : {}),
      metadata: { organizationId: input.organizationId, planId: input.planId },
    });
    return { subscriptionId: s.id };
  }

  async cancelRecurringSubscription(customerId: string, subscriptionId: string): Promise<void> {
    try {
      await mollieRequest("DELETE", `/customers/${customerId}/subscriptions/${subscriptionId}`);
    } catch (err) {
      // Already canceled or gone: nothing left to stop.
      if (err instanceof MollieApiError && (err.status === 404 || err.status === 410)) return;
      throw err;
    }
  }

  async updateRecurringAmount(
    customerId: string,
    subscriptionId: string,
    amountMinor: number,
    currency: string,
    planId: string,
  ): Promise<void> {
    await mollieRequest("PATCH", `/customers/${customerId}/subscriptions/${subscriptionId}`, {
      amount: { currency, value: toMollieValue(amountMinor) },
      description: `CleanProof ${planId} plan`,
    });
  }

  async handleProviderEvent(event: ProviderEvent): Promise<{ handled: boolean; checkoutSessionRef?: string }> {
    return event.checkoutSessionRef ? { handled: true, checkoutSessionRef: event.checkoutSessionRef } : { handled: false };
  }

  async getCustomerBillingReference(organizationId: string): Promise<string | null> {
    const db = getDb();
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.organizationId, organizationId)).limit(1);
    return sub?.mollieCustomerId ?? null;
  }
}

let instance: MolliePaymentProvider | null = null;
export function getMolliePaymentProvider(): MolliePaymentProvider {
  if (!instance) instance = new MolliePaymentProvider();
  return instance;
}
