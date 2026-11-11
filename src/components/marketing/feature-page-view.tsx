import { ProductDetailSections, FEATURE_DETAILS } from "@/components/marketing/product-detail-sections";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProductScreenshot } from "@/components/marketing/product-screenshot";
import { MarketingInteriorHeroSplit } from "@/components/marketing/marketing-interior-hero";
import { MarketingInteriorShell } from "@/components/marketing/marketing-interior-shell";
import { MarketingGlassFrame } from "@/components/marketing/marketing-glass-frame";
import { SectionIntro } from "@/components/marketing/section-intro";
import { CapabilityRail } from "@/components/marketing/capability-rail";
import { ComparisonSplit } from "@/components/marketing/comparison-split";
import type { FeaturePageContent } from "@/lib/marketing/features-content";
import { FEATURE_PAGES, getFeatureWorkflowScenario } from "@/lib/marketing/features-content";
import { PRODUCT_SCREENSHOTS } from "@/lib/marketing/image-manifest";

export function FeaturePageView({ page }: { page: FeaturePageContent }) {
  const scenario = getFeatureWorkflowScenario();

  return (
    <>
      <MarketingInteriorHeroSplit
        eyebrow={page.heroEyebrow}
        title={page.heroTitle}
        lead={page.heroLead}
        aside={
          <MarketingGlassFrame>
            <ProductScreenshot screenshotKey={page.heroScreenshotKey} variant="compact" showCaption={false} />
          </MarketingGlassFrame>
        }
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/auth/signup" className="bg-[var(--cp-teal)] px-[22px] py-3.5 text-sm font-semibold shadow-[0_7px_16px_rgba(4,123,132,0.12)] hover:bg-[var(--cp-teal-600)]">
            Start free trial →
          </Button>
          <Button href="/demo" variant="secondary" className="border-[var(--cp-border-strong)] px-[22px] py-3.5 text-sm font-semibold shadow-sm">
            Explore demo ↗
          </Button>
        </div>
        <p className="mt-6 text-xs font-medium text-[var(--cp-ink-subtle)]">
          Built for professional cleaning teams · Uses the same job workflow as the live product
        </p>
      </MarketingInteriorHeroSplit>

      <MarketingInteriorShell className="marketing-feature-page">
        <section data-design="context" className="py-[var(--marketing-section-y)]">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
              <h2 className="max-w-[620px] text-3xl font-semibold tracking-[-0.02em] text-[var(--cp-navy)] md:text-[2.1rem]">
                One clear workflow, not another disconnected tool.
              </h2>
              <p className="max-w-[425px] text-[17px] leading-snug text-[var(--cp-muted)]">
                The detail stays on the job record, so supervisors and clients see the same underlying facts.
              </p>
            </div>
          </div>
        </section>

        <section data-design="focus" className="marketing-feature-cards-section py-[var(--marketing-section-y)]">
          <div className="mx-auto max-w-6xl px-4">
            <SectionIntro
              tone="badge"
              eyebrow="Connected capabilities"
              title="Works with the rest of your job record."
              underlinePhrase="job record"
              description="Each piece below links to a focused feature page — same workflow, different surface."
            />
            <div className="mt-10">
              <CapabilityRail
                columns={3}
                items={page.highlights.map((h) => ({
                  key: `${h.title}-${h.hrefSlug}`,
                  title: h.title,
                  body: h.body,
                  href: `/features/${h.hrefSlug}`,
                  glyph: h.glyph,
                }))}
              />
            </div>
          </div>
        </section>

        <section data-design="workflow" className="border-y border-[var(--cp-border)] bg-[var(--cp-surface)] py-[var(--marketing-section-y)]">
          <div className="mx-auto max-w-6xl px-4">
            <div className="marketing-workflow-layout">
              <div className="marketing-workflow-visual min-w-0">
                <MarketingGlassFrame>
                  <ProductScreenshot screenshotKey={page.workflowScreenshotKey} variant="compact" showCaption={false} />
                </MarketingGlassFrame>
              </div>
              <div className="marketing-workflow-copy">
                <p className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.11em] text-[var(--cp-teal)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0c9897]" aria-hidden />
                  The CleanProof workflow
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[var(--cp-navy)] md:text-[2.1rem]">
                  See how it works on a demo job.
                </h2>
                <p className="mt-3 text-[17px] leading-snug text-[var(--cp-muted)]">{scenario.body}</p>
                <h3 className="mt-6 text-lg font-semibold text-[var(--cp-navy)]">{scenario.title}</h3>
                <p className="marketing-prose mt-2 text-sm text-[var(--cp-muted)]">{page.workflow}</p>
                <ul className="mt-5 space-y-2 text-sm text-[var(--cp-navy)]">
                  {scenario.checks.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="text-[var(--cp-teal)]" aria-hidden>
                        ✓
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
                <Button href="/demo" variant="secondary" className="mt-8 border-[var(--cp-border-strong)] px-5 py-3 shadow-sm">
                  Explore role-based demo →
                </Button>
              </div>
            </div>
          </div>
        </section>

        <ProductDetailSections
          sections={FEATURE_DETAILS[page.slug]}
          screenshots={[page.heroScreenshotKey, page.workflowScreenshotKey]}
        />

        <section data-design="comparison" className="py-[var(--marketing-section-y)]">
          <div className="mx-auto max-w-6xl px-4">
            <SectionIntro
              tone="badge"
              eyebrow="Built for confident handovers"
              title="Why teams adopt this"
              underlinePhrase="adopt this"
              description={page.problem}
            />
            <div className="mt-10">
              <ComparisonSplit
                withoutTitle="Without a clear review loop"
                withoutItems={[
                  "Proof scattered across chats and paper",
                  "Unclear what still needs supervisor action",
                  "Follow-ups that are hard to reconstruct later",
                ]}
                withTitle="How CleanProof helps"
                withItems={[page.solution, ...page.benefits]}
              />
            </div>
            {page.limitations?.length ? (
              <aside className="mt-6 rounded-xl border border-[var(--cp-border)] bg-[var(--cp-surface)] p-5">
                <h3 className="text-sm font-semibold text-[var(--cp-navy)]">Limitations to know</h3>
                <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--cp-muted)]">
                  {page.limitations.map((limitation) => (
                    <li key={limitation}>{limitation}</li>
                  ))}
                </ul>
              </aside>
            ) : null}
          </div>
        </section>

        <section data-design="related" className="marketing-feature-cards-section border-t border-[var(--cp-border)] py-[var(--marketing-section-y)]">
          <div className="mx-auto max-w-6xl px-4">
            <SectionIntro tone="badge" eyebrow="Connected workflows" title="Related features" underlinePhrase="Related features" />
            <ul className="marketing-related-feature-grid mt-10">
              {page.relatedSlugs.map((slug, index) => {
                const relatedPage = FEATURE_PAGES[slug as keyof typeof FEATURE_PAGES];
                if (!relatedPage) return null;
                const screenshot = PRODUCT_SCREENSHOTS[relatedPage.heroScreenshotKey];

                return (
                  <li key={slug}>
                    <Link href={`/features/${slug}`} className="marketing-related-feature-card">
                      <div className="marketing-related-feature-image">
                        <Image
                          src={screenshot.file}
                          alt={screenshot.alt}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px"
                          className="object-contain"
                        />
                        <span className="marketing-related-feature-number">{String(index + 1).padStart(2, "0")}</span>
                      </div>
                      <div className="marketing-related-feature-copy">
                        <h3>{relatedPage.title}</h3>
                        <p>{relatedPage.heroLead}</p>
                        <span>Explore feature ↗</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </MarketingInteriorShell>
    </>
  );
}
