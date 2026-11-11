import { ProductDetailSections } from "@/components/marketing/product-detail-sections";
import type { Metadata } from "next";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { MarketingInteriorHeroCenter } from "@/components/marketing/marketing-interior-hero";
import { CapabilityRail } from "@/components/marketing/capability-rail";
import { SectionIntro } from "@/components/marketing/section-intro";
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

      <section className="marketing-feature-cards-section py-[clamp(2.5rem,5vw,3.75rem)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <SectionIntro
            tone="badge"
            eyebrow="Billing clarity"
            title="No surprises in the way your team grows."
            underlinePhrase="No surprises"
            description="The prices and limits on this page are the same ones your billing page uses, so what you see here is what you pay."
          />
          <div className="mt-10">
            <CapabilityRail
              columns={3}
              items={[
                {
                  key: "cleaner",
                  title: "What counts as a cleaner?",
                  body: "Only active cleaner users count toward the plan limit.",
                  href: "/help/billing",
                  glyph: "♧",
                },
                {
                  key: "limit",
                  title: "What happens at the limit?",
                  body: "Adding sites, cleaners, or jobs beyond the plan is blocked until you upgrade.",
                  href: "/help/billing",
                  glyph: "⬡",
                },
                {
                  key: "cancel",
                  title: "Can I cancel?",
                  body: "Cancel from the billing page. Your plan stays active until the month you paid for ends.",
                  href: "/subscription-terms",
                  glyph: "▤",
                },
              ]}
            />
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
