import { ProductDetailSections } from "@/components/marketing/product-detail-sections";
import Link from "next/link";
import type { Metadata } from "next";
import { FEATURE_PAGES } from "@/lib/marketing/features-content";
import { MarketingInteriorHeroCenter } from "@/components/marketing/marketing-interior-hero";
import { MarketingFeatureIcon } from "@/components/marketing/marketing-feature-icon";
import { MarketingGlassFrame } from "@/components/marketing/marketing-glass-frame";
import { ProductScreenshot } from "@/components/marketing/product-screenshot";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Features",
  description: "Checklists, photo evidence, quality review, issues, client reports, and offline field workflow for cleaning teams.",
};

export default function FeaturesIndexPage() {
  const features = Object.values(FEATURE_PAGES);
  return (
    <>
      <MarketingInteriorHeroCenter
        eyebrow="Built for cleaning companies"
        title="Everything you need to deliver better cleaning quality."
        lead="A connected toolkit for the people doing, supervising and reviewing the work."
      />

      <section className="border-b border-[var(--cp-border)] bg-[var(--cp-section-muted)] py-[clamp(3.5rem,8vw,5.25rem)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Link
                key={f.slug}
                href={`/features/${f.slug}`}
                className="block min-h-[242px] rounded-2xl border border-[#e3ebed] bg-white p-7 shadow-[0_6px_20px_rgba(35,60,74,0.02)] transition-colors hover:border-[var(--cp-navy)]"
              >
                <MarketingFeatureIcon glyph={f.highlights[0]?.glyph ?? "✓"} />
                <h2 className="mt-4 text-xl font-semibold tracking-tight text-[var(--cp-navy)]">{f.title}</h2>
                <p className="mt-3 min-h-[48px] text-sm leading-relaxed text-[var(--cp-muted)]">{f.metaDescription}</p>
                <span className="mt-5 inline-block text-[13px] font-semibold text-[#00878b]">Explore feature ↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[clamp(3.5rem,8vw,5.25rem)]">
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
              Cleaners use the field workspace. Supervisors review submitted work. Clients receive approved reports.
            </p>
          </div>
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.13fr)] lg:items-center lg:gap-16 xl:gap-[4.5rem]">
            <div>
              <h3 className="text-[clamp(1.35rem,2.4vw,2.1rem)] font-semibold tracking-tight text-[var(--cp-navy)]">Visibility without guesswork</h3>
              <p className="mt-4 text-[17px] leading-[1.7] text-[var(--cp-muted)]">
                Every feature connects to the same job record, checklists, photos, review, issues, and client-ready output.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/auth/signup" className="bg-[var(--cp-teal)] px-[22px] py-3.5 text-sm font-semibold shadow-[0_7px_16px_rgba(4,123,132,0.12)] hover:bg-[var(--cp-teal-600)]">
                  Start free trial →
                </Button>
                <Button href="/demo" variant="secondary" className="border-[var(--cp-border-strong)] px-[22px] py-3.5 text-sm font-semibold shadow-sm">
                  Explore demo ↗
                </Button>
              </div>
            </div>
            <MarketingGlassFrame>
              <ProductScreenshot screenshotKey="quality-queue" variant="hero" />
            </MarketingGlassFrame>
          </div>
        </div>
      </section>

      <ProductDetailSections sections={[
        {
          title: "Pilot one recurring visit",
          body: "Start with a site your team knows. Run its checklist, evidence and review through one real visit before rolling the workflow out to more sites.",
        },
        {
          title: "Agree on the handover",
          body: "Decide who reviews submitted work and who shares the approved report. Give each person a clear point to take over.",
        },
      ]} />
    </>
  );
}
