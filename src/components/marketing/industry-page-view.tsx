import { Button } from "@/components/ui/button";
import { ProductScreenshot } from "@/components/marketing/product-screenshot";
import { MarketingInteriorHeroSplit } from "@/components/marketing/marketing-interior-hero";
import { MarketingLicensedPhoto } from "@/components/marketing/marketing-licensed-photo";
import { MarketingGlassFrame } from "@/components/marketing/marketing-glass-frame";
import type { IndustryPageContent } from "@/lib/marketing/industries-content";

function IndustryHeroAside({ page }: { page: IndustryPageContent }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-5">
      <MarketingLicensedPhoto
        photoKey={page.heroPhotoKey}
        alt={`${page.heroTitle}, stock photography for marketing use only`}
      />
      <MarketingGlassFrame className="flex items-center py-5 sm:py-6">
        <ProductScreenshot screenshotKey={page.heroScreenshotKey} variant="hero" showCaption={false} />
      </MarketingGlassFrame>
    </div>
  );
}

export function IndustryPageView({ page }: { page: IndustryPageContent }) {
  return (
    <>
      <MarketingInteriorHeroSplit
        eyebrow={page.heroEyebrow}
        title={page.heroTitle}
        lead={page.heroLead}
        aside={<IndustryHeroAside page={page} />}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/demo" variant="secondary" className="border-[var(--cp-border-strong)] px-[22px] py-3.5 text-sm font-semibold shadow-sm">
            Explore demo ↗
          </Button>
          <Button href="/auth/signup" className="bg-[var(--cp-teal)] px-[22px] py-3.5 text-sm font-semibold shadow-[0_7px_16px_rgba(4,123,132,0.12)] hover:bg-[var(--cp-teal-600)]">
            Start free trial →
          </Button>
        </div>
      </MarketingInteriorHeroSplit>

      <section className="marketing-industry-proof py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cp-teal)]">Designed around your contracts</p>
          <div className="marketing-industry-proof-grid mt-4">
            <article className="marketing-industry-proof-card">
              <span className="marketing-feature-proof-index">01</span>
              <h2 className="mt-4 text-xl font-semibold text-[var(--cp-navy)]">Operational challenges</h2>
              <ul className="marketing-feature-proof-list mt-4">
                {page.challenges.map((challenge) => (
                  <li key={challenge}>
                    <span aria-hidden>−</span>
                    {challenge}
                  </li>
                ))}
              </ul>
            </article>
            <article className="marketing-industry-proof-card marketing-industry-proof-card--brand">
              <span className="marketing-feature-proof-index">02</span>
              <h2 className="mt-4 text-xl font-semibold text-[var(--cp-navy)]">How CleanProof helps</h2>
              <ul className="marketing-feature-proof-list mt-4">
                {page.howCleanProofHelps.map((item) => (
                  <li key={item}>
                    <span aria-hidden>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--cp-border)] bg-[var(--cp-section-muted)] py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <p className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.11em] text-[var(--cp-teal)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0c9897]" aria-hidden />
            The CleanProof workflow
          </p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
            <h2 className="max-w-[620px] text-[clamp(1.5rem,3vw,2.2rem)] font-semibold tracking-[-0.02em] text-[var(--cp-navy)]">
              From field work to client confidence.
            </h2>
            <p className="max-w-[425px] text-[17px] leading-snug text-[var(--cp-muted)]">
              Same job record for cleaners, supervisors, and client-ready reports.
            </p>
          </div>
          <div className="mt-10 flex justify-center lg:justify-end">
            <div className="w-full max-w-[min(100%,560px)]">
              <MarketingGlassFrame>
                <ProductScreenshot screenshotKey={page.workflowScreenshotKey} variant="hero" showCaption={false} />
              </MarketingGlassFrame>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
