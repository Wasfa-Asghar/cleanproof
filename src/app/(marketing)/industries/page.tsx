import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { INDUSTRY_PAGES, type IndustrySlug } from "@/lib/marketing/industries-content";
import { MarketingInteriorHeroCenter } from "@/components/marketing/marketing-interior-hero";
import { MarketingInteriorShell } from "@/components/marketing/marketing-interior-shell";
import { MarketingGlassFrame } from "@/components/marketing/marketing-glass-frame";
import { ProductScreenshot } from "@/components/marketing/product-screenshot";
import { SectionIntro } from "@/components/marketing/section-intro";
import { Button } from "@/components/ui/button";

const CARD_IMAGE: Record<IndustrySlug, { src: string; alt: string }> = {
  "commercial-cleaning": { src: "/marketing/photos/commercial-multi-site.jpg", alt: "Commercial cleaning team across office sites" },
  "end-of-tenancy-cleaning": { src: "/marketing/photos/tenancy-handover.jpg", alt: "End-of-tenancy handover clean in a kitchen" },
  "office-cleaning": { src: "/marketing/photos/commercial-office-clean.jpg", alt: "Office workspace cleaning, stock photo" },
  "residential-cleaning": { src: "/marketing/photos/residential-trust.jpg", alt: "Residential home cleaning team" },
};

export const metadata: Metadata = {
  title: "Industries",
  description: "Cleaning quality software for commercial, office, end-of-tenancy, and residential teams.",
};

export default function IndustriesIndexPage() {
  const rows = Object.values(INDUSTRY_PAGES);
  return (
    <>
      <MarketingInteriorHeroCenter
        eyebrow="Built for cleaning companies"
        title="Built for teams that clean different spaces."
        lead="From recurring office contracts to detailed handover cleans, keep work organised and visible."
      />

      <MarketingInteriorShell>
        <section data-design="catalog">
          <div className="mx-auto px-4">
            <SectionIntro
              tone="quiet"
              eyebrow="Where teams use it"
              title="Industry playbooks"
              description="Same workflow, different contract pressure. Pick the segment that matches how you sell and report."
            />
            <div className="marketing-interior-catalog-grid mt-12 grid gap-5">
              {rows.map((ind) => {
                const img = CARD_IMAGE[ind.slug];
                return (
                  <Link key={ind.slug} href={`/industries/${ind.slug}`} className="group grid md:grid-cols-[220px_1fr]">
                    <div className="marketing-interior-catalog-image relative min-h-[200px] overflow-hidden md:min-h-full">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width: 768px) 100vw, 220px"
                      />
                    </div>
                    <div className="marketing-interior-catalog-copy">
                      <p className="text-sm font-medium text-[var(--cp-muted)]">{ind.heroEyebrow}</p>
                      <h2 className="mt-2 font-medium tracking-tight text-[var(--cp-navy)]">{ind.title}</h2>
                      <p className="marketing-prose mt-3 text-sm text-[var(--cp-muted)]">{ind.metaDescription}</p>
                      <ul className="mt-4 space-y-2">
                        {ind.focusPoints.slice(0, 3).map((point) => (
                          <li key={point.title} className="flex items-start gap-2 text-[13px] text-[var(--cp-navy)]">
                            <span className="mt-0.5 text-[var(--cp-teal)]" aria-hidden>
                              ✓
                            </span>
                            {point.title}
                          </li>
                        ))}
                      </ul>
                      <span className="mt-5 inline-block text-sm font-medium text-[var(--cp-teal)]">Explore solution →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section data-design="workflow">
          <div className="mx-auto max-w-6xl px-4">
            <div className="marketing-workflow-layout">
              <div className="marketing-workflow-visual min-w-0">
                <MarketingGlassFrame>
                  <ProductScreenshot screenshotKey="quality-queue" variant="hero" showCaption={false} />
                </MarketingGlassFrame>
              </div>
              <div className="marketing-workflow-copy">
                <p className="text-sm font-medium text-[var(--cp-muted)]">The CleanProof workflow</p>
                <h2 className="mt-2 text-3xl font-medium tracking-[-0.02em] text-[var(--cp-navy)] md:text-[2.1rem]">See what quality looks like at a glance.</h2>
                <p className="mt-3 text-[17px] leading-snug text-[var(--cp-muted)]">
                  Jobs, evidence, and review status in one supervisor-facing view. Industry pages focus on the contract pressure you recognise.
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
      </MarketingInteriorShell>
    </>
  );
}
