import type { Metadata } from "next";
import Link from "next/link";
import { MarketingInteriorHeroCenter } from "@/components/marketing/marketing-interior-hero";
import { MarketingGlassFrame } from "@/components/marketing/marketing-glass-frame";
import { ProductScreenshot } from "@/components/marketing/product-screenshot";
import { SectionIntro } from "@/components/marketing/section-intro";
import { CapabilityRail } from "@/components/marketing/capability-rail";
import { ComparisonSplit } from "@/components/marketing/comparison-split";
import {
  IconAlert,
  IconAudit,
  IconCamera,
  IconChecklist,
  IconOrgScope,
  IconStatus,
  IconTokenLink,
} from "@/components/marketing/marketing-icons";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How it works",
  description: "From workspace setup through field capture, supervisor review, and approved client reports.",
};

/** At-a-glance flow, four connected moments in every job. */
const FLOW: Array<{ n: string; title: string; body: string; Icon: typeof IconChecklist }> = [
  {
    n: "01",
    title: "Assign",
    body: "A job is created with its site, checklist template and assigned cleaner.",
    Icon: IconChecklist,
  },
  {
    n: "02",
    title: "Capture",
    body: "The cleaner works the checklist in a mobile browser and attaches photos.",
    Icon: IconCamera,
  },
  {
    n: "03",
    title: "Review",
    body: "A supervisor approves, clarifies or rejects from a single quality queue.",
    Icon: IconStatus,
  },
  {
    n: "04",
    title: "Report",
    body: "Approved visits become a read-only client report and an optional PDF.",
    Icon: IconTokenLink,
  },
];

const STEPS = [
  {
    n: "01",
    title: "Assign the job",
    body: "Owners schedule work with the right site, template, and cleaner so the field session opens with the correct checklist. Nothing depends on memory or a printed sheet left in a van.",
    extra: "A job picks up its site, its checklist template and its assigned cleaner the moment it is created, so the person on site opens the exact list expected for that building.",
    link: { href: "/help/managing-jobs", label: "Managing jobs →" },
    screenshotKey: "jobs-list" as const,
  },
  {
    n: "02",
    title: "Cleaner completes checklist and photo evidence",
    body: "Cleaners work in the mobile browser: answer each line and attach before/after photos, staying in sync with supervisor expectations.",
    extra: "The field workspace is built for a phone screen, so it works on the device a cleaner already carries. There is nothing to install and no separate app to keep updated.",
    link: { href: "/help/cleaner-mobile-workflow", label: "Field workflow →" },
    screenshotKey: "field-workspace-mobile" as const,
  },
  {
    n: "03",
    title: "Supervisor reviews the work",
    body: "Managers use the quality queue and job detail to approve, send back for clarification, or reject with a recorded reason.",
    extra: "Every decision is captured with the person and the time, so the review step becomes a traceable part of the record rather than a phone call nobody can point to later.",
    link: { href: "/help/quality-reviews", label: "Quality reviews →" },
    screenshotKey: "quality-queue" as const,
  },
  {
    n: "04",
    title: "Approved client report is shared",
    body: "After approval, generate a read-only client link and optional PDF. Clients never see your internal dashboard.",
    extra: "Only supervisor-approved jobs appear on a shared report, so what a client opens is a verified result rather than a live, in-progress view.",
    link: { href: "/help/client-reports", label: "Client reports →" },
    screenshotKey: "client-report" as const,
  },
];

/** The structured data a single job record carries end to end. */
const CARRIES: Array<{ title: string; body: string; Icon: typeof IconChecklist }> = [
  {
    title: "Site and template",
    body: "The building, the visit type and the published checklist that applies to it.",
    Icon: IconOrgScope,
  },
  {
    title: "Assigned cleaner",
    body: "Who is responsible for the visit, and when it was scheduled.",
    Icon: IconChecklist,
  },
  {
    title: "Checklist answers",
    body: "A completion state for every line, not a single submitted tick.",
    Icon: IconStatus,
  },
  {
    title: "Photo evidence",
    body: "Before and after images attached to the same visit record.",
    Icon: IconCamera,
  },
  {
    title: "Exceptions and reasons",
    body: "Skipped or blocked tasks recorded with the reason, not dropped silently.",
    Icon: IconAlert,
  },
  {
    title: "Review decision",
    body: "The supervisor outcome, with the person and time it was recorded.",
    Icon: IconAudit,
  },
];

const ROLES: Array<{ title: string; who: string; body: string; bullets: string[]; Icon: typeof IconChecklist }> = [
  {
    title: "Owner or manager",
    who: "Runs the contracts",
    body: "Sees every job waiting for action in one place and decides what is ready to share with a client.",
    bullets: ["Assign work with the right template", "Approve or return submissions", "Send an approved completion report"],
    Icon: IconOrgScope,
  },
  {
    title: "Cleaner",
    who: "Works on site",
    body: "Follows the checklist for the building in front of them and captures the evidence the visit needs.",
    bullets: ["Open the job in a mobile browser", "Answer each checklist line", "Attach photos and note exceptions"],
    Icon: IconCamera,
  },
  {
    title: "Client",
    who: "Receives the proof",
    body: "Opens a read-only completion view from a link, with no dashboard login, training, or extra tool to learn.",
    bullets: ["See what was completed and approved", "Review flagged items and outcomes", "Download the report as a PDF"],
    Icon: IconTokenLink,
  },
];

const WITHOUT = ["Paper checklists", "Scattered messages", "Missing photographs", "Manual follow-ups", "Unclear completion status"];
const WITH = ["Central job records", "Structured photo evidence", "Supervisor review queue", "Tracked corrective actions", "Shareable approved reports"];

export default function HowItWorksPage() {
  return (
    <>
      <MarketingInteriorHeroCenter
        eyebrow="How CleanProof works"
        title="From a cleaning job to a clear report."
        lead="One connected record follows every job from assignment to client-ready proof, so each person sees exactly what they need and nothing they don't."
      >
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/auth/signup" className="bg-[var(--cp-teal)] px-[22px] py-3.5 text-sm font-semibold shadow-[0_7px_16px_rgba(4,123,132,0.12)] hover:bg-[var(--cp-teal-600)]">
            Start free trial →
          </Button>
          <Button href="/demo" variant="secondary" className="border-[var(--cp-border-strong)] px-[22px] py-3.5 text-sm font-semibold shadow-sm">
            Explore demo ↗
          </Button>
        </div>
      </MarketingInteriorHeroCenter>

      <section className="marketing-feature-cards-section border-b border-[var(--cp-border)] py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <SectionIntro
            tone="badge"
            eyebrow="The shape of a job"
            title="Four moments, one connected record."
            underlinePhrase="connected record"
            description="A cleaning job moves through the same four moments every time. CleanProof keeps them joined up, so a decision made in one step is still visible in the next."
          />
          <div className="mt-12">
            <CapabilityRail
              columns={4}
              items={FLOW.map((item) => ({
                key: item.n,
                title: `${item.n} · ${item.title}`,
                body: item.body,
                Icon: item.Icon,
              }))}
              footerLabels={["Assign", "Capture", "Review", "Report"]}
            />
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--cp-border)] py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <SectionIntro
            eyebrow="Step by step"
            title="What happens, and who it is for."
            description="Each step is designed for one person doing one thing well, while feeding the same job record used by everyone else."
          />
          <div className="space-y-0">
            {STEPS.map((step, idx) => {
              const isEven = idx % 2 === 1;
              return (
                <div
                  key={step.n}
                  className="grid gap-10 border-b border-[#e5eded] py-14 last:border-b-0 lg:grid-cols-2 lg:items-center lg:gap-16 xl:gap-[4.25rem]"
                >
                  <div className={`min-w-0 ${isEven ? "lg:order-2" : ""}`}>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#b5dcd8] bg-[#ecf8f5] text-[13px] font-extrabold text-[var(--cp-teal)]">
                      {step.n}
                    </span>
                    <h2 className="mt-5 text-[clamp(1.6rem,2.8vw,2.2rem)] font-semibold tracking-tight text-[var(--cp-navy)]">{step.title}</h2>
                    <p className="mt-4 text-[17px] leading-relaxed text-[var(--cp-muted)]">{step.body}</p>
                    <p className="mt-4 text-[15px] leading-[1.7] text-[var(--cp-muted)]">{step.extra}</p>
                    <Link href={step.link.href} className="mt-5 inline-block text-[15px] font-bold text-[#07878a]">
                      {step.link.label}
                    </Link>
                  </div>
                  <div className={`min-w-0 ${isEven ? "lg:order-1" : ""}`}>
                    <MarketingGlassFrame>
                      <ProductScreenshot screenshotKey={step.screenshotKey} variant="hero" showCaption={false} />
                    </MarketingGlassFrame>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="marketing-feature-cards-section border-b border-[var(--cp-border)] py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <SectionIntro
            tone="badge"
            eyebrow="One job record"
            title="Every visit carries the same structured detail."
            underlinePhrase="structured detail"
            description="Because each step writes to the same record, the finished job is a complete account of what happened, not a summary reconstructed after the fact."
          />
          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-10">
            <div className="min-w-0">
              <MarketingGlassFrame>
                <ProductScreenshot screenshotKey="job-detail" variant="hero" showCaption={false} />
              </MarketingGlassFrame>
            </div>
            <div className="min-w-0">
              <CapabilityRail
                columns={2}
                items={CARRIES.map((item) => ({
                  key: item.title,
                  title: item.title,
                  body: item.body,
                  Icon: item.Icon,
                }))}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--cp-border)] py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <SectionIntro
            align="center"
            eyebrow="Who sees what"
            title="One workflow, three points of view."
            description="Role-based access means each person gets the view they need, from the contract owner to the client reading a finished report."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {ROLES.map((role) => (
              <article key={role.title} className="flex flex-col rounded-2xl border border-[var(--cp-border)] bg-[var(--cp-surface)] p-7">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--cp-border)] bg-[var(--cp-surface-soft)]">
                  <role.Icon className="h-6 w-6 text-[var(--cp-navy)]" />
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.11em] text-[var(--cp-teal)]">{role.who}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--cp-navy)]">{role.title}</h3>
                <p className="mt-3 text-[15px] leading-[1.7] text-[var(--cp-muted)]">{role.body}</p>
                <ul className="mt-5 grid gap-2.5 border-t border-[var(--cp-border)] pt-5">
                  {role.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--cp-navy)]">
                      <span className="mt-0.5 text-[var(--cp-teal)]" aria-hidden>
                        ✓
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--cp-border)] bg-[var(--cp-bg)] py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <SectionIntro
            eyebrow="Before / after"
            title="Spreadsheets and chat threads vs one job record."
            description="When someone asks what happened on Tuesday's clean, you either reconstruct it from memory or show them the record. CleanProof is built for the second."
          />
          <div className="mt-10">
            <ComparisonSplit
              withoutTitle="When proof is hard to find"
              withTitle="Clarity that closes the loop"
              withoutItems={WITHOUT}
              withItems={WITH}
              withoutCta={{ href: "/contact", label: "Talk to us" }}
              withCta={{ href: "/auth/signup", label: "Start free trial" }}
            />
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--cp-border)] bg-[var(--cp-section-muted)] py-12 text-center">
        <div className="mx-auto flex max-w-[1216px] flex-col items-center gap-4 px-4">
          <p className="text-sm text-[var(--cp-muted)]">
            Need the full product tour?{" "}
            <Link href="/demo" className="font-semibold text-[var(--cp-teal)] underline decoration-teal-200/80 underline-offset-[5px] hover:decoration-[var(--cp-teal)]">
              Open the interactive demo
            </Link>{" "}
            or read how{" "}
            <Link href="/industries" className="font-semibold text-[var(--cp-teal)] underline decoration-teal-200/80 underline-offset-[5px] hover:decoration-[var(--cp-teal)]">
              different cleaning teams
            </Link>{" "}
            use the same workflow.
          </p>
        </div>
      </section>

      <section className="py-14 text-center">
        <Button href="/auth/signup" className="bg-[var(--cp-teal)] px-8 py-3.5 text-sm font-semibold hover:bg-[var(--cp-teal-600)]">
          Start free trial →
        </Button>
      </section>
    </>
  );
}
