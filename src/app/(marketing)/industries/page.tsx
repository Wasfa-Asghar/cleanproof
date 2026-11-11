import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { INDUSTRY_PAGES, type IndustrySlug } from "@/lib/marketing/industries-content";
import { MarketingInteriorHeroCenter } from "@/components/marketing/marketing-interior-hero";
import { MarketingGlassFrame } from "@/components/marketing/marketing-glass-frame";
import { ProductScreenshot } from "@/components/marketing/product-screenshot";
import { Button } from "@/components/ui/button";

const CARD_IMAGE: Record<IndustrySlug, { src: string; alt: string }> = {
  "commercial-cleaning": { src: "/marketing/photos/commercial-team.jpg", alt: "Commercial cleaning team at work, stock photo" },
  "office-cleaning": { src: "/marketing/photos/commercial-office-clean.jpg", alt: "Office workspace cleaning, stock photo" },
  "end-of-tenancy-cleaning": { src: "/marketing/photos/end-of-tenancy.jpg", alt: "Move-out property cleaning, stock photo" },
  "residential-cleaning": { src: "/marketing/photos/residential-clean.jpg", alt: "Residential home cleaning, stock photo" },
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

      <section className="border-b border-[var(--cp-border)] bg-[var(--cp-section-muted)] py-[clamp(3.5rem,8vw,5.25rem)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <div className="grid gap-5 md:grid-cols-2">
            {rows.map((ind) => {
              const img = CARD_IMAGE[ind.slug];
              return (
                <Link
                  key={ind.slug}
                  href={`/industries/${ind.slug}`}
                  className="group grid grid-cols-1 overflow-hidden rounded-2xl border border-[var(--cp-border)] bg-[var(--cp-surface)] transition-colors hover:border-[var(--cp-navy)] md:grid-cols-[240px_1fr]"
                >
                  <div className="relative min-h-[210px] overflow-hidden bg-[#dae8e6] md:min-h-[260px]">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      sizes="(max-width: 768px) 100vw, 240px"
                    />
                  </div>
                  <div className="p-6 md:p-7">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-[var(--cp-teal)]">{ind.heroEyebrow}</p>
                    <h2 className="mt-2 text-lg font-semibold tracking-tight text-[var(--cp-navy)] md:text-[1.35rem]">{ind.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--cp-muted)]">{ind.metaDescription}</p>
                    <ul className="mt-5 grid gap-2">
                      {ind.focusPoints.map((point) => (
                        <li key={point.title} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-[var(--cp-navy)]">
                          <span className="mt-0.5 text-[var(--cp-teal)]" aria-hidden>
                            ✓
                          </span>
                          {point.title}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-5 inline-block text-[13px] font-semibold text-[#00878b]">Explore solution ↗</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-[clamp(3.5rem,8vw,5.25rem)]">
        <div className="mx-auto max-w-[1216px] px-4">
          <p className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.11em] text-[var(--cp-teal)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0c9897]" aria-hidden />
            The CleanProof workflow
          </p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
            <h2 className="max-w-[620px] text-[clamp(1.5rem,3vw,2.2rem)] font-semibold tracking-[-0.02em] text-[var(--cp-navy)]">
              See what quality looks like at a glance.
            </h2>
            <p className="max-w-[425px] text-[17px] leading-snug text-[var(--cp-muted)]">
              Jobs, evidence, and review status in one supervisor-facing view.
            </p>
          </div>
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.13fr)] lg:items-center lg:gap-16 xl:gap-[4.5rem]">
            <div>
              <h3 className="text-[clamp(1.35rem,2.4vw,2.1rem)] font-semibold tracking-tight text-[var(--cp-navy)]">From field work to client confidence</h3>
              <p className="mt-4 text-[17px] leading-[1.7] text-[var(--cp-muted)]">
                The same workflow scales from a single supervisor to multi-site operators, industry pages focus on the contract pressure you recognise.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/auth/signup" className="bg-[var(--cp-teal)] px-[22px] py-3.5 text-sm font-semibold shadow-[0_7px_16px_rgba(4,123,132,0.12)] hover:bg-[var(--cp-teal-600)]">
                  Start free trial →
                </Button>
                <Button href="/demo" variant="secondary" className="border-[var(--cp-border-strong)] px-[22px] py-3.5 text-sm font-semibold shadow-sm">
                  Explore demo ↗
                </Button>
              </div>
            </div>
            <MarketingGlassFrame>
              <ProductScreenshot screenshotKey="quality-queue" variant="hero" />
            </MarketingGlassFrame>
          </div>
        </div>
      </section>

    </>
  );
}
