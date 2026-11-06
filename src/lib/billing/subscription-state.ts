import type { SubscriptionStatus } from "@/lib/billing/types";

const VALID_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  trialing: ["active", "expired", "suspended"],
  active: ["past_due", "canceled", "expired", "suspended"],
  past_due: ["active", "canceled", "expired", "suspended"],
  canceled: ["active", "expired"],
  expired: ["active", "trialing"],
  suspended: ["active", "expired", "canceled"],
};

export function assertValidTransition(from: SubscriptionStatus, to: SubscriptionStatus) {
  if (from === to) return;
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new Error(`Invalid subscription transition: ${from} → ${to}`);
  }
}

export function normalizeLegacyStatus(status: string): SubscriptionStatus {
  if (status === "cancelled") return "canceled";
  if (status === "trialing" || status === "active" || status === "past_due" || status === "canceled" || status === "expired" || status === "suspended") {
    return status;
  }
  return "trialing";
}
