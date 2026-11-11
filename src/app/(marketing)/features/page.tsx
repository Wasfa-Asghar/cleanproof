import { ProductDetailSections } from "@/components/marketing/product-detail-sections";
import type { Metadata } from "next";
import { FEATURE_PAGES } from "@/lib/marketing/features-content";
import { MarketingInteriorHeroCenter } from "@/components/marketing/marketing-interior-hero";
import { MarketingInteriorShell } from "@/components/marketing/marketing-interior-shell";
import { MarketingGlassFrame } from "@/components/marketing/marketing-glass-frame";
import { ProductScreenshot } from "@/components/marketing/product-screenshot";
import { SectionIntro } from "@/components/marketing/section-intro";
import { CapabilityRail } from "@/components/marketing/capability-rail";
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

      <MarketingInteriorShell>
        <section data-design="catalog" className="marketing-feature-cards-section">
          <div className="mx-auto px-4">
            <SectionIntro
              tone="badge"
              eyebrow="Platform"
              title="From checklist to client report in one system"
              underlinePhrase="one system"
              description="Each link opens a focused page on how that piece works with the rest of the job record."
            />
            <div className="mt-12">
              <CapabilityRail
                columns={3}
                items={features.map((f) => ({
                  key: f.slug,
                  title: f.title,
                  body: f.metaDescription,
                  href: `/features/${f.slug}`,
                  glyph: f.highlights[0]?.glyph ?? "✓",
                }))}
                footerLabels={["Checklists", "Evidence", "Quality review", "Client reports"]}
              />
            </div>
          </div>
        </section>

        <section data-design="workflow">
          <div className="mx-auto max-w-6xl px-4">
            <div className="marketing-workflow-layout">
              <div className="marketing-workflow-visual min-w-0">
                <MarketingGlassFrame>
                  <ProductScreenshot screenshotKey="quality-queue" variant="hero" showCaption={false} />
                </MarketingGlassFrame>
              </div>
              <div className="marketing-workflow-copy">
                <p className="text-sm font-medium text-[var(--cp-muted)]">The CleanProof workflow</p>
                <h2 className="mt-2 text-3xl font-medium tracking-[-0.02em] text-[var(--cp-navy)] md:text-[2.1rem]">From field work to client confidence.</h2>
                <p className="mt-3 text-[17px] leading-snug text-[var(--cp-muted)]">
                  Cleaners use the field workspace. Supervisors review submitted work. Clients receive approved reports.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button href="/auth/signup" className="bg-[var(--cp-teal)] px-[22px] py-3.5 text-sm font-semibold shadow-sm hover:bg-[var(--cp-teal-600)]">
                    Start free trial →
                  </Button>
                  <Button href="/demo" variant="secondary" className="border-[var(--cp-border-strong)] px-[22px] py-3.5 text-sm font-semibold shadow-sm">
                    Explore demo ↗
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ProductDetailSections
          sections={[
            {
              title: "Pilot one recurring visit",
              body: "Start with a site your team knows. Run its checklist, evidence and review through one real visit before rolling the workflow out to more sites.",
            },
            {
              title: "Agree on the handover",
              body: "Decide who reviews submitted work and who shares the approved report. Give each person a clear point to take over.",
            },
          ]}
        />
      </MarketingInteriorShell>
    </>
  );
}
