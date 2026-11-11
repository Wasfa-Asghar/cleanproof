import "./home-reference.css";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  IconAlert,
  IconAudit,
  IconCamera,
  IconChecklist,
  IconLockSession,
  IconOrgScope,
  IconShieldUser,
  IconStatus,
  IconTokenLink,
} from "@/components/marketing/marketing-icons";
import { IndustryVisual } from "@/components/marketing/industry-visual";
import { SectionIntro } from "@/components/marketing/section-intro";
import { HomeHeroVisual } from "@/components/marketing/home-hero-visual";
import { ProductScreenshot } from "@/components/marketing/product-screenshot";
import { ProductPreviewTabs } from "@/components/marketing/product-preview-tabs";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { FEATURE_PAGES } from "@/lib/marketing/features-content";
import { INDUSTRY_PAGES } from "@/lib/marketing/industries-content";
import { CapabilityRail } from "@/components/marketing/capability-rail";
import { ComparisonSplit } from "@/components/marketing/comparison-split";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cleaning quality control & job verification software",
  description:
    "Verify cleaning jobs with checklists, before/after photos, supervisor review, and client completion reports. Built for professional cleaning teams in the UK.",
  openGraph: {
    title: "CleanProof, Every cleaning job verified",
    description: "Quality control, photo evidence, and client reports for cleaning businesses.",
  },
};

const PROBLEMS: Array<{
  title: string;
  body: string;
  Icon: typeof IconChecklist;
}> = [
  {
    title: "Missed cleaning tasks",
    body: "Checklists live on the job, not on paper in a van, so supervisors see exactly which tasks were marked complete or excepted.",
    Icon: IconChecklist,
  },
  {
    title: "Incomplete job evidence",
    body: "Before and after photos attach to the visit record, pass review, and can feed approved client reports.",
    Icon: IconCamera,
  },
  {
    title: "Customer complaints",
    body: "Issues link to jobs and re-clean assignments so you respond with context instead of guesswork.",
    Icon: IconAlert,
  },
  {
    title: "Unclear completion status",
    body: "Statuses from assigned through approved make it obvious what still needs supervisor action.",
    Icon: IconStatus,
  },
];

const SECURITY_POINTS: Array<{
  title: string;
  body: string;
  Icon: typeof IconShieldUser;
}> = [
  {
    title: "Role-based access",
    body: "Owners, managers, and cleaners each see what their role needs, no shared passwords or broad admin by default.",
    Icon: IconShieldUser,
  },
  {
    title: "Organisation-scoped data",
    body: "API routes and queries enforce tenant boundaries so one team’s jobs and evidence never bleed into another.",
    Icon: IconOrgScope,
  },
  {
    title: "Token-based client reports",
    body: "Completion reports open from time-limited links, clients get proof without a staff login or full dashboard access.",
    Icon: IconTokenLink,
  },
  {
    title: "Secure staff sessions",
    body: "Session-based authentication for dashboard users, with standard protections against common session risks.",
    Icon: IconLockSession,
  },
  {
    title: "Audit trail",
    body: "Key job and billing actions are recorded so you can trace who did what when it matters.",
    Icon: IconAudit,
  },
];

const REPORT_HIGHLIGHTS: Array<{
  text: string;
  Icon: typeof IconTokenLink;
}> = [
  {
    text: "Clients open a read-only completion view from a secure token link, no staff dashboard access.",
    Icon: IconTokenLink,
  },
  {
    text: "In production, only supervisor-approved jobs appear on shared reports; the sample uses demo data.",
    Icon: IconStatus,
  },
  {
    text: "Download a PDF for client inboxes, handover packs, or your internal records.",
    Icon: IconAudit,
  },
];

const DEMO_SCENARIO_STEPS: Array<{
  label: string;
  detail: string;
  Icon: typeof IconChecklist;
}> = [
  {
    label: "Template checklist",
    detail: "12 tasks from a published template, completed in the field workspace.",
    Icon: IconChecklist,
  },
  {
    label: "Before & after photos",
    detail: "Site photos uploaded and attached to the same visit record.",
    Icon: IconCamera,
  },
  {
    label: "Quality issue → re-clean",
    detail: "One issue logged and linked to a follow-up visit.",
    Icon: IconAlert,
  },
  {
    label: "Supervisor sign-off",
    detail: "Approval recorded on the job timeline before the client sees anything.",
    Icon: IconStatus,
  },
  {
    label: "Client report",
    detail: "Published via a secure token link, read-only, no dashboard login.",
    Icon: IconTokenLink,
  },
];

const STEPS = [
  { n: "1", title: "Assign the job", text: "Owners schedule jobs with templates and assigned cleaners." },
  { n: "2", title: "Complete & capture", text: "Cleaners finish checklists and upload photos from the field workspace." },
  { n: "3", title: "Supervisor review", text: "Managers approve, clarify, or reject from the quality queue." },
  { n: "4", title: "Client report", text: "Share approved completion reports and PDFs via secure links." },
];

export default function HomePage() {
  return (
    <div className="marketing-home">
      <section data-design="hero" className="relative overflow-x-hidden border-b border-[var(--cp-border)] bg-[var(--cp-hero-gradient)]">
        <div className="relative mx-auto">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.11em] text-[var(--cp-teal)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0c9897]" aria-hidden />
              Proof of clean for cleaning companies
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-[var(--cp-navy)] sm:text-5xl sm:leading-[1.08] lg:text-[2.65rem] xl:text-[2.85rem]">
              Prove every clean.{" "}
              <em className="not-italic text-[var(--cp-teal)]">Share every result.</em>
            </h1>
            <p className="mt-5 text-lg leading-[1.67] text-[var(--cp-muted)] sm:text-xl sm:leading-snug">
              Your team captures checklists and photos, you approve each job, and clients get a clear completion report.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                href="/auth/signup"
                className="bg-[var(--cp-teal)] px-[22px] py-3.5 text-sm font-semibold shadow-[0_7px_16px_rgba(4,123,132,0.12)] hover:bg-[var(--cp-teal-600)]"
              >
                Start free trial
              </Button>
              <Button href="/samples/completion-report" variant="secondary" className="border-[var(--cp-border-strong)] px-[22px] py-3.5 text-sm font-semibold shadow-sm">
                See a sample client report
              </Button>
            </div>
            <ul className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#547078] sm:gap-x-6">
              <li className="inline-flex items-center gap-1.5">
                <span className="text-[var(--cp-teal)]" aria-hidden>
                  ✓
                </span>{" "}
                Clear job records
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="text-[var(--cp-teal)]" aria-hidden>
                  ✓
                </span>{" "}
                Secure report sharing
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="text-[var(--cp-teal)]" aria-hidden>
                  ✓
                </span>{" "}
                Mobile-friendly workflows
              </li>
            </ul>
          </div>
          <div className="relative min-w-0">
            <HomeHeroVisual />
          </div>
        </div>
      </section>

      <section data-design="context" className="bg-[var(--cp-section-muted)] py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
            <h2 className="max-w-[620px] text-3xl font-semibold tracking-[-0.02em] text-[var(--cp-navy)] md:text-[2.1rem]">
              When you’re not on site, proof is the first thing to slip.
            </h2>
            <p className="max-w-[425px] text-[17px] leading-snug text-[var(--cp-muted)]">
              Most complaints aren’t about effort, they’re about whether you can show what was done. CleanProof keeps checklist answers, photos, and review in one job record before anything goes to the client.
            </p>
          </div>
        </div>
      </section>

      <section data-design="gaps" className="marketing-feature-cards-section py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-6xl px-4">
          <SectionIntro
            tone="badge"
            eyebrow="What breaks first"
            title="Operational gaps that show up under contract pressure"
            underlinePhrase="contract pressure"
            description="These are the patterns we hear from teams moving off paper and group chats, the same ones CleanProof is built around."
          />
          <div className="mt-12">
            <CapabilityRail
              columns={4}
              items={PROBLEMS.map((p) => ({
                key: p.title,
                title: p.title,
                body: p.body,
                Icon: p.Icon,
              }))}
            />
          </div>
        </div>
      </section>

      <section data-design="workflow" id="workflow-on-home" className="scroll-mt-24 border-y border-[var(--cp-border)] bg-[var(--cp-surface)] py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <div className="marketing-workflow-layout">
            <div className="marketing-workflow-visual">
              <ProductScreenshot screenshotKey="owner-overview" variant="hero" showCaption />
            </div>
            <div className="marketing-workflow-copy">
              <p className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.11em] text-[var(--cp-teal)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0c9897]" aria-hidden />
                The CleanProof workflow
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[var(--cp-navy)] md:text-[2.1rem]">
                One workflow. From assignment to approval.
              </h2>
              <p className="mt-3 text-[17px] leading-snug text-[var(--cp-muted)]">
                Four steps from assignment to client-ready proof. Tab through the product preview below for owner, field, and quality surfaces.
              </p>
              <ol className="marketing-workflow-steps mt-8">
                {STEPS.map((s, idx) => (
                  <li key={s.n} className="flex gap-5 border-b border-[var(--cp-border)] py-5 first:pt-0 last:border-b-0">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--cp-teal)_35%,#b5dcd8)] bg-[color-mix(in_srgb,var(--cp-teal)_8%,#ecf8f5)] text-[13px] font-extrabold tabular-nums text-[var(--cp-teal)]">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <h3 className="text-lg font-semibold tracking-tight text-[var(--cp-navy)]">{s.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-[var(--cp-muted)]">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section data-design="preview" className="mx-auto max-w-6xl px-4 py-[var(--marketing-section-y)]">
        <SectionIntro
          tone="quiet"
          eyebrow="Inside the product"
          title="Interactive product preview"
          description="Tab through roles and surfaces. These are real screens from the demo organisation; the live app is one click away."
        />
        <div className="mt-12">
          <ProductPreviewTabs />
        </div>
      </section>

      <section data-design="platform" className="marketing-feature-cards-section border-t border-[var(--cp-border)] py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-6xl px-4">
          <SectionIntro
            tone="badge"
            eyebrow="Platform"
            title="From checklist to client report in one system"
            underlinePhrase="one system"
            description="Each link opens a focused page on how that piece works with the rest of the job record, no fluff, no parallel products."
          />
          <div className="mt-12">
            <CapabilityRail
              columns={4}
              items={Object.values(FEATURE_PAGES).map((f) => ({
                key: f.slug,
                title: f.title,
                body: f.metaDescription,
                href: `/features/${f.slug}`,
                glyph: f.highlights[0]?.glyph ?? "✓",
              }))}
              footerLabels={["Checklists", "Photo evidence", "Supervisor review", "Client reports", "Field mobile", "Audit trail"]}
            />
          </div>
        </div>
      </section>

      <section data-design="comparison" className="mx-auto max-w-6xl px-4 py-[var(--marketing-section-y)]">
        <SectionIntro
          tone="quiet"
          eyebrow="Before / after"
          title="Spreadsheets and chat threads vs one job record"
          description="When someone asks what happened on Tuesday’s clean, you either reconstruct it from memory or show them the record, CleanProof is built for the second."
        />
        <div className="mt-12">
          <ComparisonSplit
            withoutTitle="When proof is hard to find"
            withTitle="Clarity that closes the loop"
            withoutItems={[
              "Paper checklists",
              "Scattered messages",
              "Missing photographs",
              "Manual follow-ups",
              "Unclear completion status",
            ]}
            withItems={[
              "Central job records",
              "Structured photo evidence",
              "Supervisor review queue",
              "Tracked corrective actions",
              "Shareable approved reports",
            ]}
            withoutCta={{ href: "/contact", label: "Talk to us" }}
            withCta={{ href: "/auth/signup", label: "Start free trial" }}
          />
        </div>
      </section>

      <section data-design="industries" className="border-y border-[var(--cp-border)] bg-[var(--cp-surface)] py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-6xl px-4">
          <SectionIntro
            tone="quiet"
            eyebrow="Where teams use it"
            title="Industry playbooks"
            description="Same workflow, different contract pressure. Pick the segment that matches how you sell and report."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {Object.values(INDUSTRY_PAGES).map((ind) => (
              <Link
                key={ind.slug}
                href={`/industries/${ind.slug}`}
                className="flex gap-4 rounded-xl border border-[var(--cp-border)] bg-[var(--cp-surface-soft)] p-5 transition-colors hover:border-[var(--cp-navy)] md:items-center"
              >
                <IndustryVisual slug={ind.slug} size="lg" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold tracking-tight text-[var(--cp-navy)]">{ind.title}</h3>
                  <p className="marketing-prose mt-2 text-sm text-[var(--cp-muted)]">{ind.metaDescription}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section data-design="report" className="border-y border-[var(--cp-border)] bg-[var(--cp-bg)] py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-12 xl:gap-16">
            <div className="max-w-xl lg:pt-1">
              <p className="text-sm font-medium text-[var(--cp-muted)]">Client-facing output</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--cp-navy)] md:text-3xl">
                Sample completion report (PDF)
              </h2>
              <p className="marketing-prose mt-3 text-sm text-[var(--cp-muted)] md:text-base">
                Show facility managers exactly what was completed and approved, on the web or as a download. The sample below is generated from demo jobs; your live account uses your own approved visits only.
              </p>
              <ul className="mt-8 space-y-4">
                {REPORT_HIGHLIGHTS.map((item) => (
                  <li key={item.text} className="flex gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--cp-border)] bg-[var(--cp-surface)]">
                      <item.Icon className="h-4 w-4 text-[var(--cp-navy)]" />
                    </span>
                    <span className="text-sm leading-relaxed text-[var(--cp-navy)]">{item.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/samples/completion-report" variant="secondary" className="border-[var(--cp-border-strong)] shadow-sm">
                  Preview in browser
                </Button>
                <Button href="/api/public/report/pdf?token=demo-client-report-token" className="bg-[var(--cp-teal)] shadow-sm hover:bg-[var(--cp-teal-600)]">
                  Download sample PDF
                </Button>
              </div>
            </div>
            <div className="min-w-0">
              <div className="rounded-xl border border-[var(--cp-border)] bg-[var(--cp-surface)] p-3 sm:p-4">
                <ProductScreenshot screenshotKey="client-report" showCaption={false} />
              </div>
              <p className="mt-4 text-center text-xs text-[var(--cp-ink-subtle)] lg:text-right">
                Sample screens. In your account, reports are built from your own approved jobs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section data-design="example" className="border-y border-[var(--cp-border)] bg-[var(--cp-surface)] py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="marketing-example-panel">
            <div className="marketing-example-layout">
              <div className="marketing-example-copy">
                <p className="marketing-example-eyebrow">
                  <span className="marketing-example-eyebrow__rule" aria-hidden />
                  End-to-end example
                </p>
                <h2 className="marketing-example-title">Riverside Office, evening cleaning</h2>
                <p className="marketing-example-lead">
                  One sample visit, from checklist to client report. The data is a demo, not a real customer or site.
                </p>
                <div className="marketing-example-actions">
                  <Button href="/demo" variant="secondary" className="border-[var(--cp-border-strong)] shadow-sm">
                    Open interactive demo
                  </Button>
                  <Button href="/samples/completion-report" className="bg-[var(--cp-teal)] shadow-sm hover:bg-[var(--cp-teal-600)]">
                    See sample report →
                  </Button>
                </div>
                <figure className="marketing-example-photo">
                  <Image
                    src="/marketing/photos/commercial-office-clean.jpg"
                    alt="Cleaning supplies ready for an evening office visit"
                    width={960}
                    height={720}
                    className="h-full w-full object-cover"
                    sizes="(max-width: 1024px) 100vw, 420px"
                  />
                </figure>
              </div>
              <div className="marketing-example-timeline">
                <p className="marketing-example-timeline__heading">What happens on this visit</p>
                <ol className="marketing-example-steps">
                  {DEMO_SCENARIO_STEPS.map((step, i) => (
                    <li key={step.label} className="marketing-example-step">
                      <span className="marketing-example-step__num" aria-hidden>
                        {i + 1}
                      </span>
                      <span className="marketing-example-step__icon" aria-hidden>
                        <step.Icon className="h-5 w-5" />
                      </span>
                      <div className="marketing-example-step__copy">
                        <p className="marketing-example-step__label">{step.label}</p>
                        <p className="marketing-example-step__detail">{step.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-design="pricing" className="mx-auto max-w-6xl px-4 py-[var(--marketing-section-y)]">
        <SectionIntro
          tone="quiet"
          eyebrow="Pricing"
          title="Plans that scale with sites and cleaners"
          description="Limits and usage read from the live billing catalog (GBP). Compare tiers on the pricing page when you’re ready to standardise quality across contracts."
        />
        <div className="mt-10">
          <PricingCards compact />
        </div>
        <p className="mt-6 text-sm">
          <Link
            href="/pricing"
            className="font-semibold text-[var(--cp-teal)] underline decoration-teal-200/80 underline-offset-[5px] transition hover:decoration-[var(--cp-teal)]"
          >
            Compare plans and limits →
          </Link>
        </p>
      </section>

      <section data-design="security" className="border-y border-[var(--cp-border)] bg-[var(--cp-bg)] py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-6xl px-4">
          <SectionIntro
            tone="quiet"
            eyebrow="Trust"
            title="Privacy & security"
            description="Built for operators who need defensible records: controlled access, tenant-scoped data, and accountable actions when clients or auditors ask questions."
          />
          <div className="marketing-security-grid mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {SECURITY_POINTS.map((item) => (
              <div
                key={item.title}
                className="marketing-security-card flex flex-col rounded-xl border border-[var(--cp-border)] bg-[var(--cp-surface)] p-5"
              >
                <div className="marketing-security-icon flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--cp-border)] bg-[var(--cp-surface-soft)]">
                  <item.Icon className="h-5 w-5 text-[var(--cp-navy)]" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[var(--cp-navy)]">{item.title}</h3>
                <p className="marketing-prose mt-2 flex-1 text-sm text-[var(--cp-muted)]">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col gap-4 rounded-xl border border-[var(--cp-border)] bg-[var(--cp-surface)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--cp-navy)]">
              <span className="font-medium">Full detail:</span> deployment, access model, and operational practices.
            </p>
            <Link
              href="/security"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[var(--cp-navy)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Security overview →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
