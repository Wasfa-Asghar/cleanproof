import { PLAN_CATALOG, type PlanId } from "@/lib/billing/plans";

export type { PlanId };

/** @deprecated Prefer PLAN_CATALOG from @/lib/billing/plans */
export const PLANS: Record<
  PlanId,
  {
    name: string;
    priceGbp: number;
    cleaners: number;
    sites: number;
    jobsPerMonth: number;
    features: string[];
  }
> = {
  starter: {
    name: PLAN_CATALOG.starter.name,
    priceGbp: PLAN_CATALOG.starter.priceMinor / 100,
    cleaners: PLAN_CATALOG.starter.activeCleaners,
    sites: PLAN_CATALOG.starter.activeSites,
    jobsPerMonth: PLAN_CATALOG.starter.jobsPerBillingPeriod,
    features: PLAN_CATALOG.starter.features,
  },
  growth: {
    name: PLAN_CATALOG.growth.name,
    priceGbp: PLAN_CATALOG.growth.priceMinor / 100,
    cleaners: PLAN_CATALOG.growth.activeCleaners,
    sites: PLAN_CATALOG.growth.activeSites,
    jobsPerMonth: PLAN_CATALOG.growth.jobsPerBillingPeriod,
    features: PLAN_CATALOG.growth.features,
  },
  pro: {
    name: PLAN_CATALOG.pro.name,
    priceGbp: PLAN_CATALOG.pro.priceMinor / 100,
    cleaners: PLAN_CATALOG.pro.activeCleaners,
    sites: PLAN_CATALOG.pro.activeSites,
    jobsPerMonth: PLAN_CATALOG.pro.jobsPerBillingPeriod,
    features: PLAN_CATALOG.pro.features,
  },
};
