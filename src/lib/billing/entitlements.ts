import { addDays, differenceInCalendarDays, isAfter, isBefore } from "date-fns";
import { getSubscriptionForOrg } from "@/lib/db/queries";
import { getPlan, isPlanId, TRIAL_PLAN_ID, type PlanId } from "@/lib/billing/plans";
import { normalizeLegacyStatus } from "@/lib/billing/subscription-state";
import type { EntitlementAccess, EntitlementSnapshot } from "@/lib/billing/types";
import { countActiveCleaners, countActiveSites, countJobsInBillingPeriod } from "@/lib/billing/usage";
import { EntitlementError } from "@/lib/billing/errors";

function billingPeriodBounds(sub: {
  status: string;
  trialStartsAt: Date | null;
  trialEndsAt: Date | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  createdAt: Date;
}) {
  const status = normalizeLegacyStatus(sub.status);
  if (status === "trialing" && sub.trialStartsAt && sub.trialEndsAt) {
    return { start: sub.trialStartsAt, end: sub.trialEndsAt };
  }
  if (sub.currentPeriodStart && sub.currentPeriodEnd) {
    return { start: sub.currentPeriodStart, end: sub.currentPeriodEnd };
  }
  const start = sub.createdAt;
  return { start, end: addDays(start, 30) };
}

export function resolveAccess(status: ReturnType<typeof normalizeLegacyStatus>, trialEndsAt: Date | null): EntitlementAccess {
  const now = new Date();
  if (status === "trialing") {
    if (trialEndsAt && isAfter(now, trialEndsAt)) return "read_only";
    return "full";
  }
  if (status === "active") return "full";
  if (status === "past_due") return "read_only";
  if (status === "canceled") return "full";
  if (status === "expired" || status === "suspended") return "read_only";
  return "read_only";
}

export async function getEntitlementSnapshot(organizationId: string): Promise<EntitlementSnapshot> {
  const sub = await getSubscriptionForOrg(organizationId);
  if (!sub) {
    throw new EntitlementError("No subscription found for organisation.");
  }
  const status = normalizeLegacyStatus(sub.status);
  const planId = (isPlanId(sub.plan) ? sub.plan : TRIAL_PLAN_ID) as PlanId;
  let effectivePlanId = planId;
  if (status === "trialing") {
    effectivePlanId = TRIAL_PLAN_ID;
  }
  const scheduledPlan =
    sub.scheduledPlan && isPlanId(sub.scheduledPlan) ? (sub.scheduledPlan as PlanId) : null;

  const trialEndsAt = sub.trialEndsAt ?? null;
  const trialDaysRemaining =
    status === "trialing" && trialEndsAt
      ? Math.max(0, differenceInCalendarDays(trialEndsAt, new Date()))
      : null;

  const access = resolveAccess(status, trialEndsAt);
  const plan = getPlan(effectivePlanId);
  const { start, end } = billingPeriodBounds(sub);

  const [activeCleaners, activeSites, jobsInPeriod] = await Promise.all([
    countActiveCleaners(organizationId),
    countActiveSites(organizationId),
    countJobsInBillingPeriod(organizationId, start, end),
  ]);

  return {
    organizationId,
    status,
    planId,
    effectivePlanId,
    access,
    limits: {
      activeCleaners: plan.activeCleaners,
      activeSites: plan.activeSites,
      jobsPerBillingPeriod: plan.jobsPerBillingPeriod,
    },
    usage: { activeCleaners, activeSites, jobsInPeriod },
    trialEndsAt,
    trialDaysRemaining,
    currentPeriodStart: sub.currentPeriodStart,
    currentPeriodEnd: sub.currentPeriodEnd,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd ?? false,
    scheduledPlan,
    scheduledPlanEffectiveAt: sub.scheduledPlanEffectiveAt,
  };
}

export type BillableAction = "create_job" | "add_site" | "add_cleaner";

export async function assertBillableAction(organizationId: string, action: BillableAction) {
  const snap = await getEntitlementSnapshot(organizationId);
  if (snap.access !== "full") {
    throw new EntitlementError(
      "Your subscription does not allow new billable operations. Upgrade or renew to continue.",
    );
  }

  if (action === "create_job") {
    if (snap.usage.jobsInPeriod >= snap.limits.jobsPerBillingPeriod) {
      throw new EntitlementError(
        `Job limit reached (${snap.limits.jobsPerBillingPeriod} per billing period). Upgrade your plan to create more jobs.`,
      );
    }
    return;
  }
  if (action === "add_site") {
    if (snap.usage.activeSites >= snap.limits.activeSites) {
      throw new EntitlementError(
        `Active site limit reached (${snap.limits.activeSites}). Archive a site or upgrade your plan.`,
      );
    }
    return;
  }
  if (action === "add_cleaner") {
    if (snap.usage.activeCleaners >= snap.limits.activeCleaners) {
      throw new EntitlementError(
        `Active cleaner limit reached (${snap.limits.activeCleaners}). Upgrade your plan to add more cleaners.`,
      );
    }
  }
}

export async function assertDowngradeAllowed(organizationId: string, targetPlanId: PlanId) {
  const snap = await getEntitlementSnapshot(organizationId);
  const target = getPlan(targetPlanId);
  const conflicts: string[] = [];
  if (snap.usage.activeCleaners > target.activeCleaners) {
    conflicts.push(`${snap.usage.activeCleaners} active cleaners (limit ${target.activeCleaners})`);
  }
  if (snap.usage.activeSites > target.activeSites) {
    conflicts.push(`${snap.usage.activeSites} active sites (limit ${target.activeSites})`);
  }
  if (conflicts.length) {
    throw new EntitlementError(
      `Cannot downgrade yet: ${conflicts.join("; ")}. Reduce usage or schedule downgrade for next period.`,
    );
  }
}

export function isTrialActive(trialEndsAt: Date | null): boolean {
  if (!trialEndsAt) return false;
  return isBefore(new Date(), trialEndsAt);
}
