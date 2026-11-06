import type { Metadata } from "next";
import Link from "next/link";
import { MarketingInteriorHeroCenter } from "@/components/marketing/marketing-interior-hero";
import { MarketingGlassFrame } from "@/components/marketing/marketing-glass-frame";
import { ProductScreenshot } from "@/components/marketing/product-screenshot";
import { CtaBand } from "@/components/marketing/cta-band";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How it works",
  description: "From workspace setup through field capture, supervisor review, and approved client reports.",
};

const STEPS = [
  {
    n: "01",
    title: "Assign the job",
    body: "Owners schedule work with the right site, template, and cleaner so the field session opens with the correct checklist.",
    link: { href: "/help/managing-jobs", label: "Managing jobs →" },
    screenshotKey: "jobs-list" as const,
  },
  {
    n: "02",
    title: "Cleaner completes checklist and photo evidence",
    body: "Cleaners work in the mobile browser: answer each line and attach before/after photos, staying in sync with supervisor expectations.",
    link: { href: "/help/cleaner-mobile-workflow", label: "Field workflow →" },
    screenshotKey: "field-workspace-mobile" as const,
  },
  {
    n: "03",
    title: "Supervisor reviews the work",
    body: "Managers use the quality queue and job detail to approve, send back for clarification, or reject with a recorded reason.",
    link: { href: "/help/quality-reviews", label: "Quality reviews →" },
    screenshotKey: "quality-queue" as const,
  },
  {
    n: "04",
    title: "Approved client report is shared",
    body: "After approval, generate a read-only client link and optional PDF, clients never see your internal dashboard.",
    link: { href: "/help/client-reports", label: "Client reports →" },
    screenshotKey: "client-report" as const,
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <MarketingInteriorHeroCenter
        eyebrow="How CleanProof works"
        title="From a cleaning job to a clear report."
        lead="A practical sequence that gives every person the right information."
      />

      <section className="border-b border-[var(--cp-border)] py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-[1216px] px-4">
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
                    <Link href={step.link.href} className="mt-5 inline-block text-[15px] font-bold text-[#07878a]">
                      {step.link.label}
                    </Link>
                  </div>
                  <div className={`min-w-0 ${isEven ? "lg:order-1" : ""}`}>
                    <MarketingGlassFrame className="py-5 sm:py-6">
                      <ProductScreenshot screenshotKey={step.screenshotKey} variant="hero" showCaption={false} />
                    </MarketingGlassFrame>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--cp-border)] bg-[var(--cp-section-muted)] py-12 text-center">
        <p className="text-sm text-[var(--cp-muted)]">
          Need the full product tour?{" "}
          <Link href="/demo" className="font-semibold text-[var(--cp-teal)] underline decoration-teal-200/80 underline-offset-[5px] hover:decoration-[var(--cp-teal)]">
            Open the interactive demo
          </Link>
        </p>
      </section>

      <section className="py-14 text-center">
        <Button href="/auth/signup" className="bg-[var(--cp-teal)] px-8 py-3.5 text-sm font-semibold hover:bg-[var(--cp-teal-600)]">
          Start free trial →
        </Button>
      </section>

      <CtaBand />
    </>
  );
}
