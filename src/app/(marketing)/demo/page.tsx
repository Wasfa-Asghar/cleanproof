import { ProductDetailSections } from "@/components/marketing/product-detail-sections";
import {
  demoLoginCleanerAction,
  demoLoginManagerAction,
  demoLoginOwnerAction,
} from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { ProductScreenshot } from "@/components/marketing/product-screenshot";
import { MarketingInteriorHeroCenter } from "@/components/marketing/marketing-interior-hero";
import { SectionIntro } from "@/components/marketing/section-intro";
import { isDemoModeEnabled } from "@/lib/env";
import type { Metadata } from "next";
import type { ProductScreenshotKey } from "@/lib/marketing/image-manifest";

export const metadata: Metadata = {
  title: "Interactive demo",
  description: "Explore CleanProof as owner, supervisor, or cleaner using sample data.",
};

const ROLES: Array<{
  action: typeof demoLoginOwnerAction;
  title: string;
  desc: string;
  screenshotKey: ProductScreenshotKey;
  hrefHint: string;
}> = [
  {
    action: demoLoginOwnerAction,
    title: "Owner",
    desc: "Sites, templates, jobs, billing, and report sharing — full organisation access in the live app.",
    screenshotKey: "owner-overview",
    hrefHint: "Opens /app/overview",
  },
  {
    action: demoLoginManagerAction,
    title: "Supervisor",
    desc: "Quality queue, job detail review, and issues — approve or send work back with reasons.",
    screenshotKey: "quality-queue",
    hrefHint: "Opens /app/overview",
  },
  {
    action: demoLoginCleanerAction,
    title: "Cleaner",
    desc: "Field workspace: checklists, before/after photos, offline queue, submit for review.",
    screenshotKey: "field-workspace-mobile",
    hrefHint: "Opens /field/today",
  },
];

export default async function DemoPage() {
  const demoModeEnabled = isDemoModeEnabled();

  return (
    <>
      <MarketingInteriorHeroCenter
        eyebrow="Product walkthrough"
        title="See the workflow from every role."
        lead={
          demoModeEnabled
            ? "Enter the real CleanProof app with seeded sample data. Click a role or the overview below — jobs, quality, issues, reports, and settings all work in the demo organisation."
            : "Explore CleanProof through real product screens from our sample workflow. Demo one-click login is not enabled in this environment."
        }
      >
        {demoModeEnabled ? (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <form action={demoLoginOwnerAction}>
              <Button type="submit" className="bg-[var(--cp-teal)] px-[22px] py-3.5 text-sm font-semibold hover:bg-[var(--cp-teal-600)]">
                Enter live demo as owner →
              </Button>
            </form>
            <form action={demoLoginManagerAction}>
              <Button type="submit" variant="secondary" className="border-[var(--cp-border-strong)] px-[22px] py-3.5 text-sm font-semibold">
                Enter as supervisor
              </Button>
            </form>
            <form action={demoLoginCleanerAction}>
              <Button type="submit" variant="secondary" className="border-[var(--cp-border-strong)] px-[22px] py-3.5 text-sm font-semibold">
                Enter as cleaner
              </Button>
            </form>
          </div>
        ) : (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/auth/signup" className="bg-[var(--cp-teal)] px-[22px] py-3.5 text-sm font-semibold hover:bg-[var(--cp-teal-600)]">
              Start free trial →
            </Button>
          </div>
        )}
      </MarketingInteriorHeroCenter>

      <section className="border-b border-[var(--cp-border)] bg-[var(--cp-section-muted)] py-[clamp(2.25rem,5vw,3.5rem)]">
        <div className="mx-auto max-w-[1216px] px-4">
          {demoModeEnabled ? (
            <form action={demoLoginOwnerAction} className="group">
              <button
                type="submit"
                className="block w-full overflow-hidden rounded-[14px] border border-[var(--cp-border)] bg-[var(--cp-surface)] text-left shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] transition hover:border-[var(--cp-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--cp-teal)]"
              >
                <ProductScreenshot screenshotKey="owner-overview" variant="hero" showCaption={false} />
                <span className="flex items-center justify-between gap-3 border-t border-[var(--cp-border)] bg-[var(--cp-surface)] px-4 py-3 text-sm">
                  <span className="font-semibold text-[var(--cp-navy)]">
                    Click to open the live owner overview
                  </span>
                  <span className="font-semibold text-[var(--cp-teal)] group-hover:underline">Enter demo →</span>
                </span>
              </button>
            </form>
          ) : (
            <ProductScreenshot screenshotKey="owner-overview" variant="hero" />
          )}
          <p className="mt-4 text-center text-xs text-[var(--cp-ink-subtle)]">
            {demoModeEnabled
              ? "Opens the real app for the demo organisation — sidebar links and actions are live."
              : "Real CleanProof screens from the demo organisation."}
          </p>
        </div>
      </section>

      <section className="py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <SectionIntro
            tone="badge"
            eyebrow="Choose a role"
            title="Three roles, one job record"
            underlinePhrase="one job record"
            description={
              demoModeEnabled
                ? "Each card opens a one-click live session. Use separate browser profiles if you need two roles open at once."
                : "Compare the owner, supervisor, and cleaner screens to see how each role contributes to a consistent job record."
            }
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {ROLES.map(({ action, title, desc, screenshotKey, hrefHint }) => (
              <div key={title} className="flex flex-col overflow-hidden rounded-[14px] border border-[var(--cp-border)] bg-white">
                <div className="border-b border-[var(--cp-border)] bg-[var(--cp-bg)] p-3">
                  <ProductScreenshot screenshotKey={screenshotKey} variant="default" showCaption={false} />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-semibold text-[var(--cp-navy)]">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--cp-muted)]">{desc}</p>
                  <p className="mt-3 text-xs text-[var(--cp-ink-subtle)]">{hrefHint}</p>
                  {demoModeEnabled ? (
                    <form action={action} className="mt-4">
                      <Button type="submit" variant="secondary" className="w-full border-[var(--cp-border-strong)] py-3 font-semibold">
                        Enter live demo as {title.toLowerCase()} →
                      </Button>
                    </form>
                  ) : (
                    <Button href="/auth/signup" variant="secondary" className="mt-4 w-full border-[var(--cp-border-strong)] py-3 font-semibold">
                      Start free trial →
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cp-border)] bg-[var(--cp-section-muted)] py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-lg font-semibold text-[var(--cp-navy)]">Public sample (no login)</h2>
          <p className="mt-2 text-sm text-[var(--cp-muted)]">Client report with sample data.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/r/demo-client-report-token" variant="secondary" className="border-[var(--cp-border-strong)]">
              Open sample report
            </Button>
            <Button href="/samples/completion-report">About the sample PDF</Button>
          </div>
        </div>
      </section>

      <ProductDetailSections
        sections={[
          {
            title: "Follow one visit through the demo",
            body: "Start in the cleaner view to see the assigned work. Then open the supervisor view to see what gets reviewed after submission.",
            points: [
              "Cleaner completes checklist answers and photos on the visit.",
              "Supervisor reviews the same job record in the quality queue.",
              "Approved work can feed a client completion report.",
            ],
          },
          {
            title: "Compare the supervisor and client views",
            body: "Look at a job in the supervisor workspace, then open the public sample report to see what the client receives.",
            points: [
              "Internal notes stay off the client-facing report.",
              "Clients open a read-only view from a secure link.",
              "Use separate roles to see how each handoff stays connected.",
            ],
          },
        ]}
      />

      <section className="mx-auto max-w-3xl px-4 py-12 text-center">
        <Button href="/auth/signup" className="bg-[var(--cp-teal)] px-8 py-3.5 font-semibold hover:bg-[var(--cp-teal-600)]">
          Create your organisation →
        </Button>
        <p className="mt-4 text-sm text-[var(--cp-muted)]">
          {demoModeEnabled
            ? "Demo sessions use seeded sample data in the live app — every sidebar feature is available for the demo organisation."
            : "One-click demo logins are not available in this environment. The screen previews above show the product workflow."}
        </p>
      </section>
    </>
  );
}
