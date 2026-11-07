import { ProductDetailSections } from "@/components/marketing/product-detail-sections";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarketingInteriorHeroCenter } from "@/components/marketing/marketing-interior-hero";
import { ProductScreenshot } from "@/components/marketing/product-screenshot";
import { MarketingGlassFrame } from "@/components/marketing/marketing-glass-frame";
import { CtaBand } from "@/components/marketing/cta-band";

export const metadata: Metadata = {
  title: "Sample completion report",
  description: "Preview and download a sample CleanProof PDF report from demo data.",
};

export default function SampleReportPage() {
  return (
    <>
      <MarketingInteriorHeroCenter
        eyebrow="Sample deliverable"
        title="What clients receive after approval."
        lead="This is the report your client receives after you approve a job. The example below uses sample data, not a real customer."
      />

      <section className="border-b border-[var(--cp-border)] bg-[var(--cp-section-muted)] py-[clamp(2.5rem,6vw,4rem)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-xl font-semibold text-[var(--cp-navy)]">Read-only web view + PDF</h2>
              <p className="mt-3 text-[17px] leading-relaxed text-[var(--cp-muted)]">
                Clients open a tokenised URL without a CleanProof login. The PDF uses the same rendering pipeline as the in-browser report, download below matches what you would attach to an email.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="/api/public/report/pdf?token=demo-client-report-token" className="bg-[var(--cp-teal)] px-6 py-3 font-semibold hover:bg-[var(--cp-teal-600)]">
                  Download sample PDF
                </Button>
                <Button href="/r/demo-client-report-token" variant="secondary" className="border-[var(--cp-border-strong)]">
                  Open in browser
                </Button>
              </div>

            </div>
            <MarketingGlassFrame>
              <ProductScreenshot screenshotKey="client-report" variant="hero" />
            </MarketingGlassFrame>
          </div>
        </div>
      </section>

      <section className="py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <h2 className="text-center text-xl font-semibold text-[var(--cp-navy)]">What is included in the package</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-[var(--cp-muted)]">Examples from the demo organisation, illustrative structure only.</p>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-[0.08em] text-[#6b8588]">Checklist completion</h3>
              <MarketingGlassFrame className="mt-4 py-4">
                <ProductScreenshot screenshotKey="job-detail" showCaption={false} />
              </MarketingGlassFrame>
              <p className="mt-3 text-sm leading-relaxed text-[var(--cp-muted)]">Line-by-line answers stay with the job so clients see the same outcomes supervisors approved.</p>
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-[0.08em] text-[#6b8588]">Before / after evidence</h3>
              <MarketingGlassFrame className="mt-4 py-4">
                <ProductScreenshot screenshotKey="field-workspace-mobile" showCaption={false} />
              </MarketingGlassFrame>
              <p className="mt-3 text-sm leading-relaxed text-[var(--cp-muted)]">Field capture groups photos with the checklist context they support.</p>
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-[0.08em] text-[#6b8588]">Supervisor decision</h3>
              <MarketingGlassFrame className="mt-4 py-4">
                <ProductScreenshot screenshotKey="quality-queue" showCaption={false} />
              </MarketingGlassFrame>
              <p className="mt-3 text-sm leading-relaxed text-[var(--cp-muted)]">Only after quality review passes does the client-facing summary unlock.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cp-border)] bg-[var(--cp-bg)] py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-sm text-[var(--cp-muted)]">
            Exploring the product end-to-end? See{" "}
            <Link href="/how-it-works" className="font-semibold text-[var(--cp-teal)] hover:underline">
              how it works
            </Link>{" "}
            or{" "}
            <Link href="/demo" className="font-semibold text-[var(--cp-teal)] hover:underline">
              interactive demo
            </Link>
            .
          </p>
        </div>
      </section>

      <ProductDetailSections sections={[
        {
          title: "Read the visit details first",
          body: "Check the site and visit date, then use the checklist and evidence to understand what the report covers.",
        },
        {
          title: "Use the report at client handover",
          body: "Share the approved visit report with the intended client contact when they need a record of completed work.",
        },
      ]} />
      <CtaBand />
    </>
  );
}
