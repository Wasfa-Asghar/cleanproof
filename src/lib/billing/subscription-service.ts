import { addDays, addMonths, format } from "date-fns";
import { and, desc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getDb } from "@/db";
import {
  auditEvents,
  billingCustomers,
  organizations,
  users,
  billingTransactions,
  paymentAttempts,
  subscriptionChangeRequests,
  subscriptions,
} from "@/db/schema";
import type { SessionPayload } from "@/lib/auth/session";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { getPlan, isPlanId, planRank, TRIAL_DAYS, TRIAL_PLAN_ID, type PlanId } from "@/lib/billing/plans";
import { assertDowngradeAllowed } from "@/lib/billing/entitlements";
import { BillingError } from "@/lib/billing/errors";
import { recordBillingEvent } from "@/lib/billing/billing-events";
import { assertValidTransition, normalizeLegacyStatus } from "@/lib/billing/subscription-state";
import { getPaymentProvider } from "@/lib/payments/provider";
import { getMockPaymentProvider } from "@/lib/payments/mock-provider";
import { isMockBillingAllowed } from "@/lib/billing/guards";
import { getSubscriptionForOrg } from "@/lib/db/queries";

function requireOwner(session: SessionPayload) {
  if (session.role !== "owner") throw new ForbiddenError();
}

export async function startTrialForOrganization(
  organizationId: string,
  runner: Pick<ReturnType<typeof getDb>, "select" | "insert"> = getDb(),
) {
  const now = new Date();
  const trialEndsAt = addDays(now, TRIAL_DAYS);

  const existing = await runner
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.organizationId, organizationId))
    .limit(1);
  if (existing.length) {
    return existing[0];
  }

  const [sub] = await runner
    .insert(subscriptions)
    .values({
      organizationId,
      plan: TRIAL_PLAN_ID,
      status: "trialing",
      trialStartsAt: now,
      trialEndsAt,
      currentPeriodStart: now,
      currentPeriodEnd: trialEndsAt,
      cancelAtPeriodEnd: false,
    })
    .returning();

  await recordBillingEvent({
    organizationId,
    eventType: "trial.started",
    idempotencyKey: `trial:${organizationId}`,
    payload: { trialEndsAt: trialEndsAt.toISOString() },
  });

  return sub;
}

export async function beginCheckout(session: SessionPayload, planId: string, idempotencyKey: string) {
  requireOwner(session);
  if (!isPlanId(planId)) throw new BillingError("Invalid plan.");
  const plan = getPlan(planId);
  const provider = getPaymentProvider();
  if (provider.simulated && !isMockBillingAllowed()) {
    throw new BillingError("Simulated checkout is not available in production.");
  }

  const db = getDb();
  const base = process.env.APP_URL ?? "http://localhost:3000";

  const [existingAttempt] = await db
    .select()
    .from(paymentAttempts)
    .where(
      and(
        eq(paymentAttempts.organizationId, session.organizationId),
        eq(paymentAttempts.idempotencyKey, idempotencyKey),
      ),
    )
    .limit(1);

  let paymentAttempt = existingAttempt;
  if (!paymentAttempt) {
    const [created] = await db
      .insert(paymentAttempts)
      .values({
        organizationId: session.organizationId,
        planId,
        amountMinor: plan.priceMinor,
        currency: plan.currency,
        status: "pending",
        provider: provider.id,
        idempotencyKey,
        simulated: provider.simulated,
      })
      .returning();
    if (!created) throw new BillingError("Could not create checkout.");
    paymentAttempt = created;
  }

  const [orgRow] = await db.select().from(organizations).where(eq(organizations.id, session.organizationId)).limit(1);
  const [userRow] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);

  const checkout = await provider.createCheckoutSession({
    organizationId: session.organizationId,
    planId,
    amountMinor: plan.priceMinor,
    currency: plan.currency,
    successUrl: `${base}/app/settings/billing?checkout=success`,
    cancelUrl: `${base}/app/settings/billing?checkout=canceled`,
    idempotencyKey,
    customerEmail: userRow?.email,
    customerName: orgRow?.legalName ?? orgRow?.displayName,
  });

  await db
    .update(paymentAttempts)
    .set({ checkoutSessionRef: checkout.checkoutSessionRef })
    .where(eq(paymentAttempts.id, paymentAttempt.id));

  return { checkoutUrl: checkout.checkoutUrl, checkoutSessionRef: checkout.checkoutSessionRef, simulated: checkout.simulated };
}

export async function completeMockCheckout(
  session: SessionPayload,
  checkoutSessionRef: string,
  outcome: "success" | "failure" | "canceled",
) {
  requireOwner(session);
  if (!isMockBillingAllowed()) throw new BillingError("Mock checkout disabled.");

  const mock = getMockPaymentProvider();
  await mock.hydrateCheckoutSession(checkoutSessionRef);
  const sessionMeta = mock.getSessionPlan(checkoutSessionRef);
  if (!sessionMeta || sessionMeta.organizationId !== session.organizationId) {
    throw new ForbiddenError();
  }
  if (!isPlanId(sessionMeta.planId)) throw new BillingError("Invalid plan on session.");

  await mock.simulateCheckoutOutcome(
    checkoutSessionRef,
    outcome === "success" ? "success" : outcome === "failure" ? "failure" : "canceled",
  );

  return reconcileCheckoutSession(session.organizationId, checkoutSessionRef, `mock-complete:${checkoutSessionRef}:${outcome}`);
}

export async function reconcileCheckoutSession(
  organizationId: string,
  checkoutSessionRef: string,
  idempotencyKey: string,
) {
  const db = getDb();
  const provider = getPaymentProvider();
  const payment = await provider.retrievePayment(checkoutSessionRef);
  if (!payment) throw new BillingError("Payment session not found.");

  const [attempt] = await db
    .select()
    .from(paymentAttempts)
    .where(
      and(
        eq(paymentAttempts.organizationId, organizationId),
        eq(paymentAttempts.checkoutSessionRef, checkoutSessionRef),
      ),
    )
    .limit(1);
  if (!attempt) throw new BillingError("Payment attempt not found.");
  if (attempt.amountMinor !== payment.amountMinor) {
    throw new BillingError("Payment amount mismatch.");
  }
  if (attempt.status === "paid" && payment.status === "paid") {
    return { status: "active" as const };
  }

  const eventRecorded = await recordBillingEvent({
    organizationId,
    eventType: `checkout.${payment.status}`,
    idempotencyKey,
    payload: { checkoutSessionRef, status: payment.status },
  });

  if (payment.status === "paid") {
    await db.transaction(async (tx) => {
      const [sub] = await tx
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.organizationId, organizationId))
        .limit(1);
      if (!sub) throw new NotFoundError();

      const from = normalizeLegacyStatus(sub.status);
      assertValidTransition(from, "active");

      const now = new Date();
      const periodEnd = attempt.simulated ? addDays(now, 30) : addMonths(now, 1);
      const planId = attempt.planId as PlanId;

      await tx
        .update(paymentAttempts)
        .set({ status: "paid", completedAt: now })
        .where(eq(paymentAttempts.id, attempt.id));

      await tx.insert(billingTransactions).values({
        organizationId,
        paymentAttemptId: attempt.id,
        type: "subscription_charge",
        amountMinor: attempt.amountMinor,
        currency: attempt.currency,
        description: `${attempt.simulated ? "[SIMULATED] " : ""}${getPlan(planId).name} subscription`,
        simulated: attempt.simulated,
      });

      const mockSubRef =
        provider.id === "mock" ? getMockPaymentProvider().getSessionSubscriptionRef(checkoutSessionRef) : undefined;
      const realCustomerRef = provider.id === "mollie" ? sub.mollieCustomerId : null;

      await tx
        .update(subscriptions)
        .set({
          plan: planId,
          status: "active",
          trialEndsAt: sub.trialEndsAt ?? now,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
          scheduledPlan: null,
          scheduledPlanEffectiveAt: null,
          providerSubscriptionRef: mockSubRef ?? sub.providerSubscriptionRef,
          updatedAt: now,
        })
        .where(eq(subscriptions.organizationId, organizationId));

      try {
        await tx.insert(billingCustomers).values({
          organizationId,
          provider: provider.id,
          externalRef: mockSubRef ?? realCustomerRef ?? `org:${organizationId}`,
          simulated: attempt.simulated,
        });
      } catch {
        /* customer row may already exist */
      }

      await tx.insert(auditEvents).values({
        organizationId,
        action: "billing.subscription_activated",
        objectType: "subscription",
        objectId: sub.id,
        payload: { planId, simulated: attempt.simulated },
      });
    });

    if (provider.id === "mollie") {
      await activateRecurringBilling(organizationId, attempt.planId as PlanId, addMonths(new Date(), 1));
    }

    if (eventRecorded.created) {
      const { notifyBillingPlanActivated } = await import("@/lib/billing/notify");
      await notifyBillingPlanActivated(organizationId, attempt.planId as PlanId);
    }
    return { status: "active" as const };
  }

  if (payment.status === "failed") {
    await db
      .update(paymentAttempts)
      .set({ status: "failed", failureReason: payment.failureReason, completedAt: new Date() })
      .where(eq(paymentAttempts.id, attempt.id));
    if (eventRecorded.created) {
      const { notifyBillingPaymentFailed } = await import("@/lib/billing/notify");
      await notifyBillingPaymentFailed(organizationId);
    }
    return { status: "failed" as const };
  }

  await db.update(paymentAttempts).set({ status: payment.status }).where(eq(paymentAttempts.id, attempt.id));
  return { status: payment.status };
}


function realProvider() {
  const provider = getPaymentProvider();
  return provider.simulated ? null : provider;
}

/** Replaces any existing recurring plan with one for `planId`, first charge on `startsOn`. Safe to call again. */
export async function activateRecurringBilling(organizationId: string, planId: PlanId, startsOn: Date) {
  const provider = realProvider();
  if (!provider?.createRecurringSubscription) return;
  const db = getDb();
  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.organizationId, organizationId)).limit(1);
  if (!sub?.mollieCustomerId) return;
  const plan = getPlan(planId);
  try {
    if (sub.mollieSubscriptionId && provider.cancelRecurringSubscription) {
      await provider.cancelRecurringSubscription(sub.mollieCustomerId, sub.mollieSubscriptionId);
    }
    const created = await provider.createRecurringSubscription({
      organizationId,
      customerId: sub.mollieCustomerId,
      planId,
      amountMinor: plan.priceMinor,
      currency: plan.currency,
      startDate: format(startsOn, "yyyy-MM-dd"),
    });
    await db
      .update(subscriptions)
      .set({
        mollieSubscriptionId: created.subscriptionId,
        providerSubscriptionRef: `${sub.mollieCustomerId}:${created.subscriptionId}`,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.organizationId, organizationId));
  } catch (err) {
    console.error("[billing] could not set up recurring billing:", err);
    await recordBillingEvent({
      organizationId,
      eventType: "subscription.recurring_setup_failed",
      idempotencyKey: `recurring-failed:${organizationId}:${new Date().toISOString().slice(0, 13)}`,
      payload: { planId },
    });
  }
}

/** Retry for paid subscriptions that have a Mollie customer but no recurring plan yet. */
export async function ensureRecurringBilling(organizationId: string) {
  if (!realProvider()) return;
  const sub = await getSubscriptionForOrg(organizationId);
  if (!sub || !sub.mollieCustomerId || sub.mollieSubscriptionId || sub.cancelAtPeriodEnd) return;
  if (normalizeLegacyStatus(sub.status) !== "active" || !isPlanId(sub.plan)) return;
  const start = sub.currentPeriodEnd && sub.currentPeriodEnd > new Date() ? sub.currentPeriodEnd : addDays(new Date(), 1);
  await activateRecurringBilling(organizationId, sub.plan as PlanId, start);
}

/** Looks at pending checkouts for this organisation and settles any that have finished (used when the customer returns). */
export async function reconcilePendingCheckouts(organizationId: string) {
  const db = getDb();
  const pending = await db
    .select()
    .from(paymentAttempts)
    .where(and(eq(paymentAttempts.organizationId, organizationId), eq(paymentAttempts.status, "pending"), eq(paymentAttempts.simulated, false)))
    .orderBy(desc(paymentAttempts.createdAt))
    .limit(3);
  for (const attempt of pending) {
    if (!attempt.checkoutSessionRef) continue;
    try {
      const payment = await getPaymentProvider().retrievePayment(attempt.checkoutSessionRef);
      if (payment && payment.status !== "pending") {
        await reconcileCheckoutSession(organizationId, attempt.checkoutSessionRef, `return:${attempt.checkoutSessionRef}:${payment.status}`);
      }
    } catch (err) {
      console.error("[billing] could not reconcile checkout:", err);
    }
  }
  await ensureRecurringBilling(organizationId);
}

/** Handles a monthly charge made by Mollie for an active subscription (called from the webhook after fetching the payment). */
export async function applyRecurringPayment(payment: {
  id: string;
  status: "pending" | "paid" | "failed" | "canceled" | "expired";
  amountMinor: number;
  currency: string;
  customerId?: string;
  subscriptionId?: string;
}) {
  if (!payment.customerId || payment.status === "pending") return { handled: false as const };
  const db = getDb();
  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.mollieCustomerId, payment.customerId)).limit(1);
  if (!sub) return { handled: false as const };
  if (payment.subscriptionId && sub.mollieSubscriptionId && payment.subscriptionId !== sub.mollieSubscriptionId) {
    return { handled: false as const }; // charge from a replaced plan
  }
  const organizationId = sub.organizationId;
  const recorded = await recordBillingEvent({
    organizationId,
    eventType: `renewal.${payment.status}`,
    idempotencyKey: `mollie-recurring:${payment.id}:${payment.status}`,
    payload: { paymentId: payment.id },
  });
  if (!recorded.created) return { handled: true as const };

  const now = new Date();
  const status = normalizeLegacyStatus(sub.status);
  if (payment.status === "paid") {
    const start = sub.currentPeriodEnd && sub.currentPeriodEnd > now ? sub.currentPeriodEnd : now;
    const planName = isPlanId(sub.plan) ? getPlan(sub.plan as PlanId).name : sub.plan;
    await db.transaction(async (tx) => {
      await tx
        .update(subscriptions)
        .set({ status: "active", currentPeriodStart: start, currentPeriodEnd: addMonths(start, 1), updatedAt: now })
        .where(eq(subscriptions.id, sub.id));
      await tx.insert(billingTransactions).values({
        organizationId,
        type: "subscription_renewal",
        amountMinor: payment.amountMinor,
        currency: payment.currency,
        description: `${planName} subscription renewal`,
        simulated: false,
      });
    });
    const { notifyBillingRenewalSuccess } = await import("@/lib/billing/notify");
    await notifyBillingRenewalSuccess(organizationId);
  } else {
    if (status === "active") {
      await db.update(subscriptions).set({ status: "past_due", updatedAt: now }).where(eq(subscriptions.id, sub.id));
    }
    const { notifyBillingPaymentFailed } = await import("@/lib/billing/notify");
    await notifyBillingPaymentFailed(organizationId);
  }
  return { handled: true as const };
}

export async function schedulePlanChange(session: SessionPayload, targetPlanId: string) {
  requireOwner(session);
  if (!isPlanId(targetPlanId)) throw new BillingError("Invalid plan.");
  const sub = await getSubscriptionForOrg(session.organizationId);
  if (!sub) throw new NotFoundError();

  const currentPlan = (isPlanId(sub.plan) ? sub.plan : TRIAL_PLAN_ID) as PlanId;
  const target = targetPlanId as PlanId;
  if (currentPlan === target) throw new BillingError("Already on this plan.");

  const db = getDb();
  const now = new Date();

  if (planRank(target) > planRank(currentPlan)) {
    return beginCheckout(session, target, `upgrade:${target}:${randomUUID()}`);
  }

  await assertDowngradeAllowed(session.organizationId, target);
  const effectiveAt = sub.currentPeriodEnd ?? addDays(now, 30);

  await db.transaction(async (tx) => {
    await tx
      .update(subscriptions)
      .set({
        scheduledPlan: target,
        scheduledPlanEffectiveAt: effectiveAt,
        updatedAt: now,
      })
      .where(eq(subscriptions.organizationId, session.organizationId));

    await tx.insert(subscriptionChangeRequests).values({
      organizationId: session.organizationId,
      kind: "downgrade",
      fromPlan: currentPlan,
      toPlan: target,
      status: "scheduled",
      effectiveAt,
      createdBy: session.userId,
    });
  });

  await recordBillingEvent({
    organizationId: session.organizationId,
    eventType: "plan.downgrade_scheduled",
    idempotencyKey: `downgrade:${session.organizationId}:${target}:${effectiveAt.toISOString()}`,
    payload: { target, effectiveAt: effectiveAt.toISOString() },
  });

  const { notifyBillingDowngradeScheduled } = await import("@/lib/billing/notify");
  await notifyBillingDowngradeScheduled(session.organizationId, target, effectiveAt);

  return { scheduled: true as const, effectiveAt };
}

export async function cancelAtPeriodEnd(session: SessionPayload) {
  requireOwner(session);
  const db = getDb();
  const now = new Date();

  const provider = realProvider();
  if (provider?.cancelRecurringSubscription) {
    const current = await getSubscriptionForOrg(session.organizationId);
    if (current?.mollieCustomerId && current.mollieSubscriptionId) {
      try {
        await provider.cancelRecurringSubscription(current.mollieCustomerId, current.mollieSubscriptionId);
      } catch (err) {
        console.error("[billing] could not cancel recurring billing:", err);
        throw new BillingError("We could not stop your recurring payments just now. Please try again or contact support.");
      }
      await db
        .update(subscriptions)
        .set({ mollieSubscriptionId: null, providerSubscriptionRef: null })
        .where(eq(subscriptions.organizationId, session.organizationId));
    }
  }
  const [updated] = await db
    .update(subscriptions)
    .set({ cancelAtPeriodEnd: true, updatedAt: now })
    .where(eq(subscriptions.organizationId, session.organizationId))
    .returning();
  if (!updated) throw new NotFoundError();

  await recordBillingEvent({
    organizationId: session.organizationId,
    eventType: "subscription.cancel_scheduled",
    idempotencyKey: `cancel:${session.organizationId}:${now.toISOString().slice(0, 10)}`,
  });

  const { notifyBillingCanceled } = await import("@/lib/billing/notify");
  await notifyBillingCanceled(session.organizationId, true);

  return updated;
}

export async function reactivateSubscription(session: SessionPayload) {
  requireOwner(session);
  const db = getDb();
  const sub = await getSubscriptionForOrg(session.organizationId);
  if (!sub) throw new NotFoundError();
  const now = new Date();

  if (realProvider() && sub.mollieCustomerId && !sub.mollieSubscriptionId) {
    if (!sub.currentPeriodEnd || sub.currentPeriodEnd <= now || !isPlanId(sub.plan)) {
      throw new BillingError("Your paid period has ended. Choose a plan to start a new subscription.");
    }
    await activateRecurringBilling(session.organizationId, sub.plan as PlanId, sub.currentPeriodEnd);
    const after = await getSubscriptionForOrg(session.organizationId);
    if (!after?.mollieSubscriptionId) {
      throw new BillingError("We could not restart your recurring payments just now. Please try again or contact support.");
    }
  }

  const [updated] = await db
    .update(subscriptions)
    .set({
      cancelAtPeriodEnd: false,
      status: normalizeLegacyStatus(sub.status) === "canceled" ? "active" : sub.status,
      updatedAt: now,
    })
    .where(eq(subscriptions.organizationId, session.organizationId))
    .returning();
  if (!updated) throw new NotFoundError();

  await recordBillingEvent({
    organizationId: session.organizationId,
    eventType: "subscription.reactivated",
    idempotencyKey: `reactivate:${session.organizationId}:${now.toISOString()}`,
  });

  const { notifyBillingReactivated } = await import("@/lib/billing/notify");
  await notifyBillingReactivated(session.organizationId);

  return updated;
}

export async function getBillingHistory(organizationId: string) {
  const db = getDb();
  return db
    .select()
    .from(billingTransactions)
    .where(eq(billingTransactions.organizationId, organizationId))
    .orderBy(desc(billingTransactions.createdAt));
}
