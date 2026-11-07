import { ProductDetailSections } from "@/components/marketing/product-detail-sections";
import type { Metadata } from "next";
import Link from "next/link";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { MarketingInteriorHeroCenter } from "@/components/marketing/marketing-interior-hero";
import { MarketingFeatureIcon } from "@/components/marketing/marketing-feature-icon";
import { getPublicPlanCards } from "@/lib/marketing/plans-display";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Starter, Growth, and Pro plans in GBP with trial, usage limits, and subscription terms.",
};

export default function PricingPage() {
  const plans = getPublicPlanCards();
  const rows = [
    { label: "Price per month", values: plans.map((p) => `£${p.priceWholePounds}`) },
    { label: "Active cleaners", values: plans.map((p) => String(p.activeCleaners)) },
    { label: "Active sites", values: plans.map((p) => String(p.activeSites)) },
    { label: "Jobs per month", values: plans.map((p) => p.jobsPerBillingPeriod.toLocaleString("en-GB")) },
    { label: "Checklists and photo evidence", values: plans.map(() => "Included") },
    { label: "Supervisor review and client reports", values: plans.map((p) => (p.id === "starter" ? "Basic reports" : "Included")) },
    { label: "Support", values: plans.map((p) => (p.id === "pro" ? "Priority" : "Email")) },
  ];
  return (
    <>
      <MarketingInteriorHeroCenter
        eyebrow="Simple, transparent pricing"
        title="Simple pricing for cleaning teams of every size."
        lead="Start with a 14 day free trial. Pick a plan when you are ready, change it any time and cancel from the billing page."
      >
        <p className="billing-note mx-auto mt-8 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#6b8588]">
          Monthly billing · GBP · 14 day free trial, no card needed
        </p>
      </MarketingInteriorHeroCenter>

      <section className="border-b border-[var(--cp-border)] bg-[var(--cp-section-muted)] py-[clamp(2.5rem,6vw,4rem)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <PricingCards />
          <div className="mt-12 overflow-x-auto rounded-2xl border border-[var(--cp-border)] bg-white">
            <table className="w-full min-w-[560px] text-left text-sm">
              <caption className="sr-only">Plan comparison</caption>
              <thead>
                <tr className="border-b border-[var(--cp-border)] bg-[var(--cp-surface-soft)] text-[var(--cp-navy)]">
                  <th scope="col" className="px-5 py-3 font-semibold">Compare plans</th>
                  {plans.map((p) => (
                    <th key={p.id} scope="col" className="px-5 py-3 font-semibold">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[var(--cp-muted)]">
                {rows.map((r) => (
                  <tr key={r.label} className="border-b border-[var(--cp-border)] last:border-b-0">
                    <th scope="row" className="px-5 py-3 font-medium text-[var(--cp-navy)]">
                      {r.label}
                    </th>
                    {r.values.map((v, i) => (
                      <td key={i} className="px-5 py-3">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-center text-xs leading-relaxed text-[var(--cp-ink-subtle)]">
            Prices are per month in GBP. VAT is added where it applies.
          </p>
        </div>
      </section>

      <section className="py-[clamp(3rem,7vw,5rem)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
            <h2 className="max-w-[620px] text-[clamp(1.5rem,3vw,2.1rem)] font-semibold tracking-[-0.02em] text-[var(--cp-navy)]">
              No surprises in the way your team grows.
            </h2>
            <p className="max-w-[425px] text-[17px] leading-snug text-[var(--cp-muted)]">
              The prices and limits on this page are the same ones your billing page uses, so what you see here is what you pay.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <Link
              href="/help/billing"
              className="block min-h-[242px] rounded-2xl border border-[#e3ebed] bg-white p-7 shadow-[0_6px_20px_rgba(35,60,74,0.02)] transition-colors hover:border-[var(--cp-navy)]"
            >
              <MarketingFeatureIcon glyph="♧" />
              <h3 className="mt-4 text-xl font-semibold text-[var(--cp-navy)]">What counts as a cleaner?</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--cp-muted)]">Only active cleaner users count toward the plan limit.</p>
              <span className="mt-5 inline-block text-[13px] font-semibold text-[#00878b]">Read billing guide ↗</span>
            </Link>
            <Link
              href="/help/billing"
              className="block min-h-[242px] rounded-2xl border border-[#e3ebed] bg-white p-7 shadow-[0_6px_20px_rgba(35,60,74,0.02)] transition-colors hover:border-[var(--cp-navy)]"
            >
              <MarketingFeatureIcon glyph="⬡" />
              <h3 className="mt-4 text-xl font-semibold text-[var(--cp-navy)]">What happens at the limit?</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--cp-muted)]">Adding sites, cleaners, or jobs beyond the plan is blocked until you upgrade.</p>
              <span className="mt-5 inline-block text-[13px] font-semibold text-[#00878b]">Read billing guide ↗</span>
            </Link>
            <Link
              href="/subscription-terms"
              className="block min-h-[242px] rounded-2xl border border-[#e3ebed] bg-white p-7 shadow-[0_6px_20px_rgba(35,60,74,0.02)] transition-colors hover:border-[var(--cp-navy)]"
            >
              <MarketingFeatureIcon glyph="▤" />
              <h3 className="mt-4 text-xl font-semibold text-[var(--cp-navy)]">Can I cancel?</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--cp-muted)]">Cancel from the billing page. Your plan stays active until the month you paid for ends.</p>
              <span className="mt-5 inline-block text-[13px] font-semibold text-[#00878b]">Subscription terms →</span>
            </Link>
          </div>
        </div>
      </section>

      <ProductDetailSections sections={[
        {
          title: "Estimate your job volume",
          body: "Count the visits your team expects to record in a typical month. Use that estimate and your team size when comparing plan limits.",
        },
        {
          title: "Use the trial to test a full handover",
          body: "Set up a site, assign a visit, review the submission and open its report before choosing a paid plan.",
        },
      ]} />
    </>
  );
}
