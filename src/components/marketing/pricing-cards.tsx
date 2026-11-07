import { Button } from "@/components/ui/button";
import { getPublicPlanCards, TRIAL_COPY } from "@/lib/marketing/plans-display";

export function PricingCards({ compact }: { compact?: boolean }) {
  const plans = getPublicPlanCards();
  return (
    <div>
      <div className={`grid gap-6 ${compact ? "md:grid-cols-3" : "lg:grid-cols-3"}`}>
        {plans.map((plan, idx) => {
          const featured = idx === 1;
          return (
            <div
              key={plan.id}
              className={`marketing-price-card relative flex flex-col rounded-[18px] border bg-white p-8 shadow-[0_6px_20px_rgba(35,60,74,0.05)] ${
                featured ? "border-2 border-[var(--cp-teal)] shadow-[0_20px_45px_rgba(0,132,134,0.1)]" : "border-[#dce8e9]"
              }`}
            >
              {featured ? (
                <p className="absolute -top-3 right-5 rounded-full bg-[var(--cp-teal)] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Most popular
                </p>
              ) : null}
              <h3 className="text-[23px] font-semibold tracking-tight text-[var(--cp-navy)]">{plan.name}</h3>
              <p className="mt-2 min-h-[44px] text-[13px] leading-relaxed text-[var(--cp-muted)]">{plan.tagline}</p>
              <div className="price mt-4 text-[54px] font-extrabold leading-none tracking-[-0.06em] text-[var(--cp-navy)]">
                <small className="align-top text-[23px] font-extrabold tracking-normal">£</small>
                {Number.isInteger(plan.priceWholePounds) ? plan.priceWholePounds : plan.priceWholePounds.toFixed(0)}
                <span className="ml-1 text-[14px] font-semibold tracking-normal text-[#657e84]">/month · {plan.currency}</span>
              </div>
              <div className="my-5 h-px bg-[#e3ecee]" />
              <ul className="mb-8 flex-1 space-y-3 text-[13px] leading-snug text-[var(--cp-navy)]">
                <li>✓ {plan.activeCleaners} active cleaners</li>
                <li>✓ {plan.activeSites} active sites</li>
                <li>✓ {plan.jobsPerBillingPeriod} jobs per billing period</li>
                {plan.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <Button
                href="/auth/signup"
                className={`w-full rounded-[11px] border py-3.5 text-sm font-semibold ${
                  featured
                    ? "border-transparent bg-[var(--cp-teal)] text-white shadow-[0_7px_16px_rgba(4,123,132,0.12)] hover:bg-[var(--cp-teal-600)]"
                    : "border-[#c4d8dc] bg-white text-[#173848] hover:bg-slate-50"
                }`}
                variant={featured ? "primary" : "secondary"}
              >
                Start {TRIAL_COPY.days}-day free trial →
              </Button>
            </div>
          );
        })}
      </div>
      <div className="mt-6 space-y-3 text-sm text-[var(--cp-muted)]">
        <p>{TRIAL_COPY.note}</p>
        <p className="text-xs leading-relaxed text-[var(--cp-ink-subtle)]">
          Prices are in pounds sterling per month and may be subject to VAT. Payments are taken securely by Mollie. Cancel any time from the billing page.
        </p>
      </div>
    </div>
  );
}
