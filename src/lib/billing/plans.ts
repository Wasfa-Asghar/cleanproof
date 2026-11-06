export type PlanId = "starter" | "growth" | "pro";

export type PlanDefinition = {
  id: PlanId;
  name: string;
  /** Short marketing line — not a feature guarantee beyond plan catalog */
  tagline: string;
  /** Price in minor currency units (pence for GBP). */
  priceMinor: number;
  currency: "GBP";
  activeCleaners: number;
  activeSites: number;
  jobsPerBillingPeriod: number;
  features: string[];
};

/** Versioned catalog — adjust prices/limits here for future pricing changes. */
export const PLAN_CATALOG: Record<PlanId, PlanDefinition> = {
  starter: {
    id: "starter",
    name: "Starter",
    tagline: "For small teams getting organised",
    priceMinor: 1900,
    currency: "GBP",
    activeCleaners: 3,
    activeSites: 10,
    jobsPerBillingPeriod: 100,
    features: ["Checklists", "Basic reports", "Email notifications"],
  },
  growth: {
    id: "growth",
    name: "Growth",
    tagline: "For growing operations",
    priceMinor: 3900,
    currency: "GBP",
    activeCleaners: 10,
    activeSites: 35,
    jobsPerBillingPeriod: 500,
    features: ["Issues & reviews", "Customer reports", "Quality queue"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "For multi-site teams",
    priceMinor: 7900,
    currency: "GBP",
    activeCleaners: 30,
    activeSites: 100,
    jobsPerBillingPeriod: 2000,
    features: ["Advanced analytics", "Custom exports", "Priority support"],
  },
};

export const TRIAL_DAYS = 14;

/** During trial, entitlements match the selected trial plan (starter) limits. */
export const TRIAL_PLAN_ID: PlanId = "starter";

export function isPlanId(value: string): value is PlanId {
  return value === "starter" || value === "growth" || value === "pro";
}

export function getPlan(planId: PlanId): PlanDefinition {
  return PLAN_CATALOG[planId];
}

export function formatPlanPrice(plan: PlanDefinition): string {
  return `£${(plan.priceMinor / 100).toFixed(0)}`;
}

export function planRank(planId: PlanId): number {
  if (planId === "starter") return 1;
  if (planId === "growth") return 2;
  return 3;
}
