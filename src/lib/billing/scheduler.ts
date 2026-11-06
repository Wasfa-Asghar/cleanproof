import { addDays, isAfter } from "date-fns";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { subscriptions } from "@/db/schema";
import { normalizeLegacyStatus, assertValidTransition } from "@/lib/billing/subscription-state";
import { recordBillingEvent } from "@/lib/billing/billing-events";
import { assertDowngradeAllowed } from "@/lib/billing/entitlements";
import { getPlan, isPlanId, type PlanId } from "@/lib/billing/plans";
import { getPaymentProvider } from "@/lib/payments/provider";
import {
  notifyBillingRenewalSuccess,
  notifyBillingTrialExpired,
  notifyBillingTrialEndingSoon,
} from "@/lib/billing/notify";
import { differenceInCalendarDays } from "date-fns";

export type BillingProcessorResult = {
  trialsExpired: number;
  trialsReminded: number;
  cancellationsApplied: number;
  downgradesApplied: number;
  renewalsProcessed: number;
  pastDueApplied: number;
};

export async function processBillingCycle(now = new Date()): Promise<BillingProcessorResult> {
  const db = getDb();
  const result: BillingProcessorResult = {
    trialsExpired: 0,
    trialsReminded: 0,
    cancellationsApplied: 0,
    downgradesApplied: 0,
    renewalsProcessed: 0,
    pastDueApplied: 0,
  };

  const allSubs = await db.select().from(subscriptions);

  for (const sub of allSubs) {
    const status = normalizeLegacyStatus(sub.status);

    if (status === "trialing" && sub.trialEndsAt && isAfter(now, sub.trialEndsAt)) {
      assertValidTransition("trialing", "expired");
      await db
        .update(subscriptions)
        .set({ status: "expired", updatedAt: now })
        .where(eq(subscriptions.id, sub.id));
      await recordBillingEvent({
        organizationId: sub.organizationId,
        eventType: "trial.expired",
        idempotencyKey: `trial-expired:${sub.organizationId}`,
      });
      await notifyBillingTrialExpired(sub.organizationId);
      result.trialsExpired++;
      continue;
    }

    if (status === "trialing" && sub.trialEndsAt) {
      const daysLeft = differenceInCalendarDays(sub.trialEndsAt, now);
      if (daysLeft === 3 || daysLeft === 1) {
        await notifyBillingTrialEndingSoon(sub.organizationId, daysLeft);
        result.trialsReminded++;
      }
    }

    if (
      sub.cancelAtPeriodEnd &&
      sub.currentPeriodEnd &&
      isAfter(now, sub.currentPeriodEnd) &&
      (status === "active" || status === "canceled")
    ) {
      await db
        .update(subscriptions)
        .set({ status: "expired", cancelAtPeriodEnd: false, updatedAt: now })
        .where(eq(subscriptions.id, sub.id));
      await recordBillingEvent({
        organizationId: sub.organizationId,
        eventType: "subscription.expired",
        idempotencyKey: `sub-expired:${sub.organizationId}:${sub.currentPeriodEnd.toISOString()}`,
      });
      result.cancellationsApplied++;
    }

    if (
      sub.scheduledPlan &&
      sub.scheduledPlanEffectiveAt &&
      isAfter(now, sub.scheduledPlanEffectiveAt) &&
      isPlanId(sub.scheduledPlan)
    ) {
      try {
        await assertDowngradeAllowed(sub.organizationId, sub.scheduledPlan as PlanId);
        if (sub.mollieCustomerId && sub.mollieSubscriptionId) {
          const provider = getPaymentProvider();
          if (provider.updateRecurringAmount) {
            const target = getPlan(sub.scheduledPlan as PlanId);
            await provider.updateRecurringAmount(sub.mollieCustomerId, sub.mollieSubscriptionId, target.priceMinor, target.currency, target.id);
          }
        }
        await db
          .update(subscriptions)
          .set({
            plan: sub.scheduledPlan,
            scheduledPlan: null,
            scheduledPlanEffectiveAt: null,
            updatedAt: now,
          })
          .where(eq(subscriptions.id, sub.id));
        await recordBillingEvent({
          organizationId: sub.organizationId,
          eventType: "plan.downgrade_applied",
          idempotencyKey: `downgrade-applied:${sub.organizationId}:${sub.scheduledPlan}`,
        });
        result.downgradesApplied++;
      } catch {
        await db
          .update(subscriptions)
          .set({ scheduledPlan: null, scheduledPlanEffectiveAt: null, updatedAt: now })
          .where(eq(subscriptions.id, sub.id));
      }
    }

    /* Real (Mollie) subscriptions renew only when a payment arrives. Never extend access without one. */
    if (sub.mollieSubscriptionId && status === "active" && sub.currentPeriodEnd && !sub.cancelAtPeriodEnd) {
      const graceEnds = addDays(sub.currentPeriodEnd, 5);
      if (isAfter(now, graceEnds)) {
        await db.update(subscriptions).set({ status: "past_due", updatedAt: now }).where(eq(subscriptions.id, sub.id));
        await recordBillingEvent({
          organizationId: sub.organizationId,
          eventType: "subscription.past_due",
          idempotencyKey: `past-due:${sub.organizationId}:${sub.currentPeriodEnd.toISOString()}`,
        });
        result.pastDueApplied++;
      }
      continue;
    }

    if (status === "active" && sub.currentPeriodEnd && isAfter(now, sub.currentPeriodEnd) && !sub.cancelAtPeriodEnd) {
      const nextStart = sub.currentPeriodEnd;
      const nextEnd = addDays(nextStart, 30);
      await db
        .update(subscriptions)
        .set({
          currentPeriodStart: nextStart,
          currentPeriodEnd: nextEnd,
          updatedAt: now,
        })
        .where(eq(subscriptions.id, sub.id));
      await recordBillingEvent({
        organizationId: sub.organizationId,
        eventType: "subscription.renewed",
        idempotencyKey: `renewal:${sub.organizationId}:${nextStart.toISOString()}`,
      });
      await notifyBillingRenewalSuccess(sub.organizationId);
      result.renewalsProcessed++;
    }
  }

  return result;
}
