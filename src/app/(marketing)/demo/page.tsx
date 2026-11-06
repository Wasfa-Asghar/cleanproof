import { notFound } from "next/navigation";
import {
  demoLoginCleanerAction,
  demoLoginManagerAction,
  demoLoginOwnerAction,
} from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { ProductScreenshot } from "@/components/marketing/product-screenshot";
import { MarketingInteriorHeroCenter } from "@/components/marketing/marketing-interior-hero";
import { MarketingGlassFrame } from "@/components/marketing/marketing-glass-frame";
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
}> = [
  {
    action: demoLoginOwnerAction,
    title: "Owner",
    desc: "Sites, templates, jobs, billing, and report sharing, full organisation access.",
    screenshotKey: "owner-overview",
  },
  {
    action: demoLoginManagerAction,
    title: "Supervisor",
    desc: "Quality queue, job detail review, and issues, approve or send work back with reasons.",
    screenshotKey: "quality-queue",
  },
  {
    action: demoLoginCleanerAction,
    title: "Cleaner",
    desc: "Mobile field workspace: checklists, before/after photos, offline queue, submit for review.",
    screenshotKey: "field-workspace-mobile",
  },
];

export default async function DemoPage() {
  if (!isDemoModeEnabled()) notFound();

  return (
    <>
      <MarketingInteriorHeroCenter
        eyebrow="Product walkthrough"
        title="See the workflow from every role."
        lead="Demo mode uses seeded data only. Choose a role to open the real app, the screens below are captured from the same routes after you sign in."
      />

      <section className="border-b border-[var(--cp-border)] bg-[var(--cp-section-muted)] py-[clamp(2.5rem,6vw,4rem)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <MarketingGlassFrame>
            <ProductScreenshot screenshotKey="owner-overview" variant="hero" />
          </MarketingGlassFrame>
          <p className="mt-4 text-center text-xs text-[var(--cp-ink-subtle)]">
            Run <code className="rounded bg-white/80 px-1">npm run dev:e2e</code> and{" "}
            <code className="rounded bg-white/80 px-1">node scripts/capture-marketing-screenshots.mjs</code> to refresh captures from the seeded organisation.
          </p>
        </div>
      </section>

      <section className="py-[var(--marketing-section-y)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <h2 className="text-xl font-semibold text-[var(--cp-navy)]">Three roles, one job record</h2>
          <p className="mt-2 max-w-2xl text-[var(--cp-muted)]">
            Each card opens a one-click demo session for that role. Use separate browser profiles if you need two roles open at once.
          </p>
          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {ROLES.map(({ action, title, desc, screenshotKey }) => (
              <div key={title} className="flex flex-col overflow-hidden rounded-[18px] border border-[#e0e9eb] bg-white">
                <div className="border-b border-[var(--cp-border)] bg-[var(--cp-bg)] p-3">
                  <ProductScreenshot screenshotKey={screenshotKey} variant="default" showCaption={false} />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-semibold text-[var(--cp-navy)]">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--cp-muted)]">{desc}</p>
                  <form action={action} className="mt-5">
                    <Button type="submit" variant="secondary" className="w-full border-[var(--cp-border-strong)] py-3 font-semibold">
                      Enter demo as {title.toLowerCase()} →
                    </Button>
                  </form>
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

      <section className="mx-auto max-w-3xl px-4 py-12 text-center">
        <Button href="/auth/signup" className="bg-[var(--cp-teal)] px-8 py-3.5 font-semibold hover:bg-[var(--cp-teal-600)]">
          Create your organisation →
        </Button>
        <p className="mt-4 text-sm text-[var(--cp-muted)]">
          Production disables one-click demo logins unless explicitly configured for a sandbox.
        </p>
      </section>
    </>
  );
}
