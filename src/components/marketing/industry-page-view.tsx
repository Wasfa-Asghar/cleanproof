import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProductScreenshot } from "@/components/marketing/product-screenshot";
import { MarketingInteriorShell } from "@/components/marketing/marketing-interior-shell";
import { MarketingLicensedPhoto, LICENSED_PHOTO_PATH } from "@/components/marketing/marketing-licensed-photo";
import { MarketingGlassFrame } from "@/components/marketing/marketing-glass-frame";
import { SectionIntro } from "@/components/marketing/section-intro";
import { ComparisonSplit } from "@/components/marketing/comparison-split";
import "./interior-reference.css";
import {
  IconAlert,
  IconAudit,
  IconCamera,
  IconChecklist,
  IconStatus,
} from "@/components/marketing/marketing-icons";
import type { IndustryPageContent, IndustryPoint, IndustrySplitSection } from "@/lib/marketing/industries-content";

const VERIFY_ICONS = [IconChecklist, IconCamera, IconAlert, IconAudit] as const;
const OUTCOME_ICONS = [IconChecklist, IconStatus, IconAudit, IconCamera] as const;

function IndustryHero({ page }: { page: IndustryPageContent }) {
  return (
    <section className="marketing-industry-hero relative isolate overflow-hidden border-b border-[var(--cp-border)]">
      <Image
        src={LICENSED_PHOTO_PATH[page.heroPhotoKey]}
        alt=""
        fill
        priority
        className="object-cover object-[68%_center]"
        sizes="100vw"
        aria-hidden
      />
      {/* Left solid for copy → right clear so the photo reads */}
      <div className="marketing-industry-hero-wash" aria-hidden />
      <div className="relative z-10 mx-auto grid max-w-[1344px] px-4 py-[clamp(3.75rem,9vw,6.5rem)] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-10">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.11em] text-[var(--cp-teal)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0c9897]" aria-hidden />
            {page.heroEyebrow}
          </p>
          <h1 className="mt-5 text-[clamp(2.25rem,4vw,3.35rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-[var(--cp-navy)]">
            {page.heroTitle}
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-[1.67] text-[var(--cp-muted)] sm:text-lg">{page.heroLead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/demo" variant="secondary" className="border-[var(--cp-border-strong)] bg-white/90 px-[22px] py-3.5 text-sm font-semibold shadow-sm backdrop-blur-sm">
              Explore demo ↗
            </Button>
            <Button href="/auth/signup" className="bg-[var(--cp-teal)] px-[22px] py-3.5 text-sm font-semibold shadow-[0_7px_16px_rgba(4,123,132,0.12)] hover:bg-[var(--cp-teal-600)]">
              Start free trial →
            </Button>
          </div>
        </div>
        <div className="hidden min-h-[220px] lg:block" aria-hidden />
      </div>
    </section>
  );
}

function FocusSection({ page }: { page: IndustryPageContent }) {
  return (
    <section data-design="focus">
      <div className="mx-auto px-4">
        <SectionIntro
          tone="quiet"
          eyebrow="Built around your contracts"
          title="Where quality pressure actually shows up."
          description="Every cleaning contract has its own pressure points. These are the ones this industry raises again and again, and the ones CleanProof is shaped around."
        />
        <div className="marketing-interior-focus-grid mt-14">
          {page.focusPoints.map((point) => {
            const photoKey = point.photoKey ?? page.heroPhotoKey;
            return (
              <article key={point.title} className="marketing-interior-focus-card">
                <div className="marketing-interior-focus-media">
                  <Image
                    src={LICENSED_PHOTO_PATH[photoKey]}
                    alt={point.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <h3>{point.title}.</h3>
                <p>{point.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function VerifySection({ page }: { page: IndustryPageContent }) {
  return (
    <section data-design="verify">
      <div className="mx-auto px-4">
        <SectionIntro align="center" tone="quiet" eyebrow="Accountable by default" title={page.verifyTitle} description={page.verifyLead} />
        <div className="marketing-interior-unified-grid mx-auto mt-12 max-w-5xl grid sm:grid-cols-2">
          {page.verifyPoints.map((point, index) => {
            const Icon = VERIFY_ICONS[index % VERIFY_ICONS.length];
            return (
              <article key={point.title}>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--cp-border)] bg-[var(--cp-surface)]">
                    <Icon className="h-5 w-5 text-[var(--cp-navy)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold tracking-tight text-[var(--cp-navy)]">{point.title}</h3>
                    <p className="marketing-prose mt-2 text-sm text-[var(--cp-muted)]">{point.body}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SplitSection({ split, reversed = false }: { split: IndustrySplitSection; reversed?: boolean }) {
  return (
    <section data-design="split" className={reversed ? "bg-[var(--cp-bg)]" : "bg-[var(--cp-surface)]"}>
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-16 xl:gap-[4.5rem]">
        <div className={`marketing-interior-photo min-w-0 ${reversed ? "lg:order-2" : ""}`}>
          <MarketingLicensedPhoto
            photoKey={split.photoKey}
            alt={split.photoAlt}
            showCaption={false}
            className="!h-[min(400px,58vw)] !rounded-none !shadow-none lg:!h-[440px]"
          />
        </div>
        <div className={`min-w-0 ${reversed ? "lg:order-1" : ""}`}>
          <p className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.11em] text-[var(--cp-teal)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0c9897]" aria-hidden />
            {split.eyebrow}
          </p>
          <h2 className="mt-3 text-[clamp(1.55rem,3vw,2.3rem)] font-medium leading-[1.15] tracking-[-0.03em] text-[var(--cp-navy)]">
            {split.title}
          </h2>
          <p className="marketing-prose mt-4 text-base text-[var(--cp-muted)]">{split.body}</p>
          <ul className="mt-6 space-y-3">
            {split.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2 text-sm leading-relaxed text-[var(--cp-navy)]">
                <span className="mt-0.5 text-[var(--cp-teal)]" aria-hidden>
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

function ComparisonSection({ page }: { page: IndustryPageContent }) {
  return (
    <section data-design="comparison">
      <div className="mx-auto max-w-6xl px-4">
        <SectionIntro
          tone="quiet"
          eyebrow="Common friction"
          title="What usually goes wrong, and what changes."
          description="Most quality failures are not about effort. They come from missing structure."
        />
        <div className="mt-12">
          <ComparisonSplit
            withoutLabel="What teams run into"
            withLabel="How CleanProof helps"
            withoutTitle="When structure is missing"
            withTitle="A record you can stand behind"
            withoutItems={page.challenges}
            withItems={page.howCleanProofHelps}
            withoutCta={{ href: "/contact", label: "Talk to us" }}
            withCta={{ href: "/auth/signup", label: "Start free trial" }}
          />
        </div>
      </div>
    </section>
  );
}

function OutcomesSection({ outcomes }: { outcomes: IndustryPoint[] }) {
  return (
    <section data-design="outcomes">
      <div className="mx-auto px-4">
        <SectionIntro
          tone="quiet"
          eyebrow="What changes on the ground"
          title="Outcomes your team and your clients notice."
          description="Practical differences teams describe after moving their quality process into CleanProof."
        />
        <div className="marketing-interior-outcomes-grid mt-12 grid sm:grid-cols-2">
          {outcomes.map((item, index) => {
            const Icon = OUTCOME_ICONS[index % OUTCOME_ICONS.length];
            return (
              <article key={item.title}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--cp-border)] bg-[var(--cp-surface-soft)]">
                  <Icon className="h-5 w-5 text-[var(--cp-navy)]" />
                </div>
                <h3 className="mt-4 tracking-tight text-[var(--cp-navy)]">{item.title}</h3>
                <p className="marketing-prose mt-2 text-sm text-[var(--cp-muted)]">{item.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection({ page }: { page: IndustryPageContent }) {
  return (
    <section data-design="workflow">
      <div className="mx-auto max-w-6xl px-4">
        <div className="marketing-workflow-layout">
          <div className="marketing-workflow-visual min-w-0">
            <MarketingGlassFrame>
              <ProductScreenshot screenshotKey={page.workflowScreenshotKey} variant="hero" showCaption={false} />
            </MarketingGlassFrame>
          </div>
          <div className="marketing-workflow-copy">
            <p className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.11em] text-[var(--cp-teal)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0c9897]" aria-hidden />
              The CleanProof workflow
            </p>
            <h2 className="mt-3 text-3xl font-medium tracking-[-0.02em] text-[var(--cp-navy)] md:text-[2.1rem]">
              From field work to client confidence.
            </h2>
            <p className="mt-3 text-[17px] leading-snug text-[var(--cp-muted)]">
              Same job record for cleaners, supervisors, and client-ready reports.
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
  );
}

export function IndustryPageView({ page }: { page: IndustryPageContent }) {
  return (
    <>
      <IndustryHero page={page} />

      <MarketingInteriorShell>
        <section data-design="context">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
              <h2 className="max-w-[620px] text-3xl font-medium tracking-[-0.02em] text-[var(--cp-navy)] md:text-[2.1rem]">
                {page.introTitle}
              </h2>
              <p className="max-w-[425px] text-[17px] leading-snug text-[var(--cp-muted)]">{page.introLead}</p>
            </div>
          </div>
        </section>

        <FocusSection page={page} />
        <VerifySection page={page} />
        <SplitSection split={page.splitPrimary} />
        <SplitSection split={page.splitSecondary} reversed />
        <ComparisonSection page={page} />
        <OutcomesSection outcomes={page.outcomes} />
        <WorkflowSection page={page} />
      </MarketingInteriorShell>
    </>
  );
}
