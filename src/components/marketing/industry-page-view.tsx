import { Button } from "@/components/ui/button";
import { ProductScreenshot } from "@/components/marketing/product-screenshot";
import { MarketingInteriorHeroSplit } from "@/components/marketing/marketing-interior-hero";
import { MarketingLicensedPhoto } from "@/components/marketing/marketing-licensed-photo";
import { MarketingGlassFrame } from "@/components/marketing/marketing-glass-frame";
import { SectionIntro } from "@/components/marketing/section-intro";
import { IconAlert, IconAudit, IconChecklist, IconStatus } from "@/components/marketing/marketing-icons";
import type { IndustryPageContent, IndustryPoint, IndustrySplitSection } from "@/lib/marketing/industries-content";

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

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.11em] text-[var(--cp-teal)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#0c9897]" aria-hidden />
      {children}
    </p>
  );
}

function FocusSection({ page }: { page: IndustryPageContent }) {
  return (
    <section className="border-b border-[var(--cp-border)] py-[var(--marketing-section-y)]">
      <div className="mx-auto max-w-[1216px] px-4">
        <SectionIntro
          eyebrow="Built around your contracts"
          title="Where quality pressure actually shows up."
          description="Every cleaning contract has its own pressure points. These are the ones this industry raises again and again, and the ones CleanProof is shaped around."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {page.focusPoints.map((point, index) => (
            <article
              key={point.title}
              className="flex flex-col rounded-2xl border border-[var(--cp-border)] bg-[var(--cp-surface)] p-7 shadow-[0_18px_44px_-32px_rgba(11,37,58,0.35)]"
            >
              <span className="marketing-feature-proof-index">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-[var(--cp-navy)]">{point.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.7] text-[var(--cp-muted)]">{point.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function VerifySection({ page }: { page: IndustryPageContent }) {
  return (
    <section className="border-b border-[var(--cp-border)] bg-[var(--cp-section-muted)] py-[var(--marketing-section-y)]">
      <div className="mx-auto max-w-[1216px] px-4">
        <SectionIntro align="center" eyebrow="Accountable by default" title={page.verifyTitle} description={page.verifyLead} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {page.verifyPoints.map((point) => (
            <article
              key={point.title}
              className="flex items-start gap-4 rounded-2xl border border-[var(--cp-border)] bg-[var(--cp-surface)] p-6 shadow-[0_18px_44px_-36px_rgba(11,37,58,0.35)]"
            >
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ecf8f5] text-[var(--cp-teal)]">
                <IconStatus className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold tracking-tight text-[var(--cp-navy)]">{point.title}</h3>
                <p className="mt-2 text-[15px] leading-[1.7] text-[var(--cp-muted)]">{point.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SplitSection({ split, reversed = false }: { split: IndustrySplitSection; reversed?: boolean }) {
  return (
    <section className="border-b border-[var(--cp-border)] py-[var(--marketing-section-y)]">
      <div className="mx-auto grid max-w-[1216px] items-center gap-10 px-4 lg:grid-cols-2 lg:gap-16 xl:gap-[4.5rem]">
        <div className={`min-w-0 ${reversed ? "lg:order-2" : ""}`}>
          <MarketingLicensedPhoto photoKey={split.photoKey} alt={split.photoAlt} showCaption={false} />
        </div>
        <div className={`min-w-0 ${reversed ? "lg:order-1" : ""}`}>
          <Eyebrow>{split.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[clamp(1.55rem,3vw,2.3rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-[var(--cp-navy)]">
            {split.title}
          </h2>
          <p className="mt-4 text-[17px] leading-[1.72] text-[var(--cp-muted)]">{split.body}</p>
          <ul className="mt-6 grid gap-3">
            {split.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-[15px] leading-relaxed text-[var(--cp-navy)]">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ecf8f5] text-[11px] font-bold text-[var(--cp-teal)]" aria-hidden>
                  ✓
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function GapSection({ page }: { page: IndustryPageContent }) {
  return (
    <section className="marketing-industry-proof border-b border-[var(--cp-border)] py-[var(--marketing-section-y)]">
      <div className="mx-auto max-w-[1216px] px-4">
        <SectionIntro
          eyebrow="Common friction"
          title="What usually goes wrong, and what changes."
          description="Most quality failures are not about effort. They come from missing structure. Here is the friction this industry reports most, next to how CleanProof answers it."
        />
        <div className="marketing-industry-proof-grid mt-8">
          <article className="marketing-industry-proof-card">
            <span className="marketing-feature-proof-index">01</span>
            <h3 className="mt-4 flex items-center gap-2 text-xl font-semibold text-[var(--cp-navy)]">
              <IconAlert className="h-5 w-5" />
              What teams run into
            </h3>
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
            <h3 className="mt-4 flex items-center gap-2 text-xl font-semibold text-[var(--cp-navy)]">
              <IconChecklist className="h-5 w-5" />
              How CleanProof helps
            </h3>
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
  );
}

function OutcomesSection({ outcomes }: { outcomes: IndustryPoint[] }) {
  return (
    <section className="border-b border-[var(--cp-border)] bg-[var(--cp-bg)] py-[var(--marketing-section-y)]">
      <div className="mx-auto max-w-[1216px] px-4">
        <SectionIntro
          eyebrow="What changes on the ground"
          title="Outcomes your team and your clients notice."
          description="These are the practical, day-to-day differences teams describe after moving their quality process into CleanProof."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {outcomes.map((item) => (
            <article key={item.title} className="rounded-2xl border border-[var(--cp-border)] bg-[var(--cp-surface)] p-6">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#ecf8f5] text-[var(--cp-teal)]">
                <IconAudit className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold tracking-tight text-[var(--cp-navy)]">{item.title}</h3>
              <p className="mt-2 text-[15px] leading-[1.7] text-[var(--cp-muted)]">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection({ page }: { page: IndustryPageContent }) {
  return (
    <section className="bg-[var(--cp-section-muted)] py-[var(--marketing-section-y)]">
      <div className="mx-auto max-w-[1216px] px-4">
        <Eyebrow>The CleanProof workflow</Eyebrow>
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
        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="/auth/signup" className="bg-[var(--cp-teal)] px-[22px] py-3.5 text-sm font-semibold shadow-[0_7px_16px_rgba(4,123,132,0.12)] hover:bg-[var(--cp-teal-600)]">
            Start free trial →
          </Button>
          <Button href="/demo" variant="secondary" className="border-[var(--cp-border-strong)] px-[22px] py-3.5 text-sm font-semibold shadow-sm">
            Explore demo ↗
          </Button>
        </div>
      </div>
    </section>
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

      <section className="border-b border-[var(--cp-border)] bg-[var(--cp-bg)] py-[clamp(3rem,6vw,4.5rem)]">
        <div className="mx-auto max-w-[900px] px-4 text-center">
          <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] font-medium leading-[1.2] tracking-[-0.03em] text-[var(--cp-navy)]">
            {page.introTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-[70ch] text-[17px] leading-[1.78] text-[var(--cp-muted)]">{page.introLead}</p>
        </div>
      </section>

      <FocusSection page={page} />
      <VerifySection page={page} />
      <SplitSection split={page.splitPrimary} />
      <SplitSection split={page.splitSecondary} reversed />
      <GapSection page={page} />
      <OutcomesSection outcomes={page.outcomes} />
      <WorkflowSection page={page} />
    </>
  );
}
