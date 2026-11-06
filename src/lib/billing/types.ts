import type { PlanId } from "@/lib/billing/plans";

export const SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "expired",
  "suspended",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export type EntitlementAccess = "full" | "read_only" | "blocked";

export type UsageSnapshot = {
  activeCleaners: number;
  activeSites: number;
  jobsInPeriod: number;
};

export type EntitlementSnapshot = {
  organizationId: string;
  status: SubscriptionStatus;
  planId: PlanId;
  effectivePlanId: PlanId;
  access: EntitlementAccess;
  limits: {
    activeCleaners: number;
    activeSites: number;
    jobsPerBillingPeriod: number;
  };
  usage: UsageSnapshot;
  trialEndsAt: Date | null;
  trialDaysRemaining: number | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  scheduledPlan: PlanId | null;
  scheduledPlanEffectiveAt: Date | null;
};
