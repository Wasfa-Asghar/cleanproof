import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { getEntitlementSnapshot } from "@/lib/billing/entitlements";
import { PLAN_CATALOG, formatPlanPrice, type PlanId } from "@/lib/billing/plans";
import { getBillingHistory, reconcilePendingCheckouts } from "@/lib/billing/subscription-service";
import { getPaymentProvider } from "@/lib/payments/provider";
import { isMockBillingAllowed } from "@/lib/billing/guards";

export const metadata = { title: "Billing" };
export const instant = false;

function UsageBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm text-slate-600">
        <span>{label}</span>
        <span>
          {used} / {limit}
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full bg-slate-800" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const session = await getSession();
  if (!session) return null;
  const params = await searchParams;
  if (params.checkout === "success") {
    await reconcilePendingCheckouts(session.organizationId);
  }
  const snap = await getEntitlementSnapshot(session.organizationId);
  const history = await getBillingHistory(session.organizationId);
  const plan = PLAN_CATALOG[snap.effectivePlanId];
  const checkoutBanner =
    params.checkout === "success"
      ? "Thanks. We are confirming your payment. If your plan has not updated yet, refresh this page in a minute."
      : params.checkout === "canceled"
        ? "Checkout was canceled."
        : null;

  const isOwner = session.role === "owner";

  return (
    <>
      <PageHeader
        title="Billing"
        description="Subscription, usage limits, plan changes, and billing history."
      />
      {checkoutBanner ? (
        <p className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
          {checkoutBanner}
        </p>
      ) : null}
      {snap.access === "read_only" ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          Your account is in read-only mode for billable features. You can still view and export existing data.
          Choose a plan to restore full access.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-600">Current plan</p>
          <p className="mt-1 text-2xl font-semibold">
            {plan.name}, {formatPlanPrice(plan)}/mo
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Status: <span className="font-medium capitalize">{snap.status.replace("_", " ")}</span>
          </p>
          {snap.status === "trialing" && snap.trialDaysRemaining != null ? (
            <p className="mt-1 text-sm text-slate-600">{snap.trialDaysRemaining} day(s) left in trial</p>
          ) : null}
          {snap.currentPeriodStart && snap.currentPeriodEnd ? (
            <p className="mt-2 text-xs text-slate-500">
              Billing period: {snap.currentPeriodStart.toLocaleDateString("en-GB")} —{" "}
              {snap.currentPeriodEnd.toLocaleDateString("en-GB")}
            </p>
          ) : null}
          {snap.cancelAtPeriodEnd ? (
            <p className="mt-2 text-sm text-amber-800">Cancellation scheduled at period end.</p>
          ) : null}
          {snap.scheduledPlan ? (
            <p className="mt-2 text-sm text-slate-600">
              Downgrade to {PLAN_CATALOG[snap.scheduledPlan].name} scheduled
              {snap.scheduledPlanEffectiveAt
                ? ` for ${snap.scheduledPlanEffectiveAt.toLocaleDateString("en-GB")}`
                : ""}
              .
            </p>
          ) : null}

          <div className="mt-6 space-y-4">
            <UsageBar used={snap.usage.activeCleaners} limit={snap.limits.activeCleaners} label="Active cleaners" />
            <UsageBar used={snap.usage.activeSites} limit={snap.limits.activeSites} label="Active sites" />
            <UsageBar
              used={snap.usage.jobsInPeriod}
              limit={snap.limits.jobsPerBillingPeriod}
              label="Jobs this billing period"
            />
          </div>

          {isOwner ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {!snap.cancelAtPeriodEnd ? (
                <form action="/api/billing/cancel" method="post">
                  <Button type="submit" variant="secondary">
                    Cancel at period end
                  </Button>
                </form>
              ) : (
                <form action="/api/billing/reactivate" method="post">
                  <Button type="submit">Reactivate subscription</Button>
                </form>
              )}
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-500">Only organisation owners can change billing.</p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-800">Plans</p>
          <ul className="mt-4 space-y-4">
            {(Object.keys(PLAN_CATALOG) as PlanId[]).map((id) => {
              const p = PLAN_CATALOG[id];
              const current = id === snap.planId || id === snap.effectivePlanId;
              return (
                <li key={id} className="rounded-lg border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {p.name} {current ? "(current)" : ""}
                      </p>
                      <p className="text-sm text-slate-600">
                        {formatPlanPrice(p)}/mo · {p.activeCleaners} cleaners · {p.activeSites} sites ·{" "}
                        {p.jobsPerBillingPeriod} jobs/period
                      </p>
                    </div>
                    {isOwner && !current ? (
                      <form action="/api/billing/change-plan" method="post">
                        <input type="hidden" name="planId" value={id} />
                        <Button type="submit" className="text-sm px-3 py-1.5">
                          Select
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
          {isMockBillingAllowed() && getPaymentProvider().simulated ? (
            <p className="mt-4 text-xs text-amber-800">
              Upgrades use a development-only mock checkout. Payments are simulated and labeled as such in history.
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm font-medium text-slate-800">Billing history</p>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No transactions yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {history.map((tx) => (
              <li key={tx.id} className="flex justify-between py-3 text-sm">
                <div>
                  <p className="text-slate-800">{tx.description}</p>
                  <p className="text-xs text-slate-500">{tx.createdAt.toLocaleString("en-GB")}</p>
                </div>
                <p className="font-medium text-slate-800">
                  £{(tx.amountMinor / 100).toFixed(2)}
                  {tx.simulated ? " (simulated)" : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
