import { PLAN_CATALOG, TRIAL_DAYS, type PlanId } from "@/lib/billing/plans";
import { formatPlanPrice } from "@/lib/billing/plans";

export const PLAN_ORDER: PlanId[] = ["starter", "growth", "pro"];

export function getPublicPlanCards() {
  return PLAN_ORDER.map((id) => {
    const plan = PLAN_CATALOG[id];
    return {
      id,
      name: plan.name,
      tagline: plan.tagline,
      priceWholePounds: plan.priceMinor / 100,
      priceLabel: `${formatPlanPrice(plan)}/mo`,
      currency: plan.currency,
      activeCleaners: plan.activeCleaners,
      activeSites: plan.activeSites,
      jobsPerBillingPeriod: plan.jobsPerBillingPeriod,
      features: plan.features,
    };
  });
}

export const TRIAL_COPY = {
  days: TRIAL_DAYS,
  cardRequired: false as const,
  note: "New organisations receive a 14-day trial on signup without entering a payment card. Add payment details only when you choose a paid plan.",
};
