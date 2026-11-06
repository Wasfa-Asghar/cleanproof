import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { ProductScreenshot } from "@/components/marketing/product-screenshot";
import { CtaBand } from "@/components/marketing/cta-band";
import { MarketingInteriorHeroSplit } from "@/components/marketing/marketing-interior-hero";
import { MarketingGlassFrame } from "@/components/marketing/marketing-glass-frame";
import { MarketingFeatureIcon } from "@/components/marketing/marketing-feature-icon";
import { MarketingFieldPhoneMock } from "@/components/marketing/marketing-field-phone-mock";
import type { FeaturePageContent } from "@/lib/marketing/features-content";
import { FEATURE_PAGES, getFeatureWorkflowScenario } from "@/lib/marketing/features-content";

function FeatureHeroAside({ page }: { page: FeaturePageContent }) {
  if (page.heroLayout === "split_phone") {
    return (
      <MarketingGlassFrame className="flex flex-col items-center gap-6 py-6 sm:py-8">
        <MarketingFieldPhoneMock />
        <div className="w-full max-w-sm">
          <ProductScreenshot screenshotKey={page.heroScreenshotKey} variant="default" showCaption={false} />
        </div>
        <p className="text-center text-[11px] leading-snug text-[var(--cp-ink-subtle)]">
          Stylised phone frame for layout · narrow viewport screenshot from the field workspace below.
        </p>
      </MarketingGlassFrame>
    );
  }

  if (page.heroLayout === "split_report") {
    return (
      <MarketingGlassFrame className="py-6 sm:py-8">
        <ProductScreenshot screenshotKey={page.heroScreenshotKey} variant="hero" showCaption={false} />
        <p className="mt-3 text-center text-[11px] text-[var(--cp-ink-subtle)]">
          Public completion view, token link (demo data when captured from seeded E2E).
        </p>
      </MarketingGlassFrame>
    );
  }

  return (
    <MarketingGlassFrame className="py-6 sm:py-8">
      <ProductScreenshot screenshotKey={page.heroScreenshotKey} variant="hero" />
    </MarketingGlassFrame>
  );
}

export function FeaturePageView({ page }: { page: FeaturePageContent }) {
  const scenario = getFeatureWorkflowScenario();

  return (
    <>
      <MarketingInteriorHeroSplit
        eyebrow={page.heroEyebrow}
        title={page.heroTitle}
        lead={page.heroLead}
        aside={<FeatureHeroAside page={page} />}
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
            <MarketingGlassFrame>
              <ProductScreenshot screenshotKey={page.workflowScreenshotKey} variant="hero" showCaption={false} />
              <p className="mt-3 text-center text-[11px] text-[var(--cp-ink-subtle)]">
                Screenshot from a demo organisation with sample data.
              </p>
            </MarketingGlassFrame>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-[var(--marketing-section-y)]">
        <h2 className="text-xl font-semibold text-[var(--cp-navy)]">Why teams adopt this</h2>
        <p className="mt-4 text-[var(--cp-muted)]">{page.problem}</p>
        <h3 className="mt-10 text-lg font-semibold text-[var(--cp-navy)]">How CleanProof helps</h3>
        <p className="mt-3 text-[var(--cp-muted)]">{page.solution}</p>
        <h3 className="mt-10 text-lg font-semibold text-[var(--cp-navy)]">Typical workflow</h3>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--cp-muted)]">
          {page.benefits.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        {page.limitations?.length ? (
          <>
            <h3 className="mt-10 text-lg font-semibold text-[var(--cp-navy)]">Limitations to know</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--cp-muted)]">
              {page.limitations.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      <section className="border-t border-[var(--cp-border)] bg-[var(--cp-section-muted)] py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-xl font-semibold text-[var(--cp-navy)]">Related features</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {page.relatedSlugs.map((slug) => (
              <li key={slug}>
                <Link href={`/features/${slug}`} className="text-sm font-medium text-[var(--cp-teal)] hover:underline">
                  {FEATURE_PAGES[slug as keyof typeof FEATURE_PAGES]?.title ?? slug}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-[var(--marketing-section-y)]">
        <h2 className="text-xl font-semibold text-[var(--cp-navy)]">FAQ</h2>
        <div className="mt-6">
          <FaqAccordion items={page.faq} />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
