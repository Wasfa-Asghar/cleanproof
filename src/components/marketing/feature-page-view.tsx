import { ProductDetailSections, FEATURE_DETAILS } from "@/components/marketing/product-detail-sections";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProductScreenshot } from "@/components/marketing/product-screenshot";
import { MarketingInteriorHeroSplit } from "@/components/marketing/marketing-interior-hero";
import { MarketingFeatureIcon } from "@/components/marketing/marketing-feature-icon";
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
        aside={<ProductScreenshot screenshotKey={page.heroScreenshotKey} variant="compact" showCaption={false} />}
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

      <section className="border-b border-[var(--cp-border)] bg-[var(--cp-section-muted)] py-[clamp(3.5rem,8vw,5.25rem)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
            <h2 className="max-w-[min(100%,620px)] text-[clamp(1.5rem,3vw,2.2rem)] font-semibold tracking-[-0.02em] text-[var(--cp-navy)]">
              One clear workflow, not another disconnected tool.
            </h2>
            <p className="max-w-[425px] text-[17px] leading-snug text-[var(--cp-muted)]">
              The detail stays on the job record, so supervisors and clients see the same underlying facts.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {page.highlights.map((h) => (
              <Link
                key={`${h.title}-${h.hrefSlug}`}
                href={`/features/${h.hrefSlug}`}
                className="block min-h-[242px] rounded-2xl border border-[#e3ebed] bg-white p-7 shadow-[0_6px_20px_rgba(35,60,74,0.02)] transition-colors hover:border-[var(--cp-navy)]"
              >
                <MarketingFeatureIcon glyph={h.glyph} />
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-[var(--cp-navy)]">{h.title}</h3>
                <p className="mt-3 min-h-[48px] text-sm leading-relaxed text-[var(--cp-muted)]">{h.body}</p>
                <span className="mt-5 inline-block text-[13px] font-semibold text-[#00878b]">Explore feature ↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--cp-border)] py-[clamp(3.5rem,8vw,5.25rem)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <p className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.11em] text-[var(--cp-teal)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0c9897]" aria-hidden />
            The CleanProof workflow
          </p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
            <h2 className="max-w-[620px] text-[clamp(1.5rem,3vw,2.2rem)] font-semibold tracking-[-0.02em] text-[var(--cp-navy)]">
              See how it works on a demo job.
            </h2>
            <p className="max-w-[425px] text-[17px] leading-snug text-[var(--cp-muted)]">
              {scenario.body}
            </p>
          </div>
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.13fr)] lg:items-center lg:gap-16 xl:gap-[4.5rem]">
            <div>
              <h3 className="text-[clamp(1.35rem,2.4vw,2.1rem)] font-semibold tracking-tight text-[var(--cp-navy)]">{scenario.title}</h3>
              <p className="mt-4 text-[17px] leading-[1.7] text-[var(--cp-muted)]">{page.workflow}</p>
              <div className="mt-7 grid gap-3 text-[15px] font-medium text-[#1b655f]">
                {scenario.checks.map((line) => (
                  <div key={line}>✓ {line}</div>
                ))}
              </div>
              <Button href="/demo" variant="secondary" className="mt-8 border-[var(--cp-border-strong)] px-5 py-3 shadow-sm">
                Explore role-based demo →
              </Button>
            </div>
            <ProductScreenshot screenshotKey={page.workflowScreenshotKey} variant="compact" />
          </div>
        </div>
      </section>

      <section className="marketing-feature-proof py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cp-teal)]">Built for confident handovers</p>
          <div className="marketing-feature-proof-panel mt-4">
            <div className="marketing-feature-proof-intro">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--cp-navy)] md:text-3xl">Why teams adopt this</h2>
              <p className="mt-3 max-w-4xl leading-relaxed text-[var(--cp-muted)]">{page.problem}</p>
            </div>
            <div className="marketing-feature-proof-grid mt-8">
              <article className="marketing-feature-proof-card">
                <span className="marketing-feature-proof-index">01</span>
                <h3 className="mt-4 text-lg font-semibold text-[var(--cp-navy)]">How CleanProof helps</h3>
                <p className="mt-3 leading-relaxed text-[var(--cp-muted)]">{page.solution}</p>
              </article>
              <article className="marketing-feature-proof-card">
                <span className="marketing-feature-proof-index">02</span>
                <h3 className="mt-4 text-lg font-semibold text-[var(--cp-navy)]">Typical workflow</h3>
                <ul className="marketing-feature-proof-list mt-4">
                  {page.benefits.map((benefit) => (
                    <li key={benefit}>
                      <span aria-hidden>✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
            {page.limitations?.length ? (
              <aside className="marketing-feature-limitations mt-6">
                <h3 className="text-sm font-semibold text-[var(--cp-navy)]">Limitations to know</h3>
                <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--cp-muted)]">
                  {page.limitations.map((limitation) => (
                    <li key={limitation}>{limitation}</li>
                  ))}
                </ul>
              </aside>
            ) : null}
          </div>
        </div>
      </section>

      <section className="marketing-related-features py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cp-teal)]">Connected workflows</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--cp-navy)] md:text-3xl">Related features</h2>
          <ul className="marketing-related-feature-grid mt-7">
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

      <ProductDetailSections
        sections={FEATURE_DETAILS[page.slug]}
        screenshots={[page.heroScreenshotKey, page.workflowScreenshotKey]}
      />
    </>
  );
}
