import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { MarketingInteriorHeroCenter } from "@/components/marketing/marketing-interior-hero";
import { HelpSearch } from "@/components/marketing/help-search";
import { HELP_ARTICLES, HELP_CATEGORIES, HELP_FEATURED_SLUGS } from "@/lib/content/help-articles";

export const metadata: Metadata = {
  title: "Help centre",
  description: "Guides for jobs, field workflow, evidence, reviews, reports, and billing.",
};

export default function HelpIndexPage() {
  const articles = Object.values(HELP_ARTICLES);
  const featured = HELP_FEATURED_SLUGS.map((slug) => HELP_ARTICLES[slug]).filter(Boolean);

  return (
    <>
      <MarketingInteriorHeroCenter
        eyebrow="Resources"
        title="Help centre"
        lead="Practical guides aligned with the current CleanProof product. Search filters the list below on this device, nothing leaves your browser."
      >
        <HelpSearch articles={articles} categories={HELP_CATEGORIES} />
      </MarketingInteriorHeroCenter>

      <section className="border-b border-[var(--cp-border)] bg-[var(--cp-section-muted)] py-12">
        <div className="mx-auto max-w-[1216px] px-4">
          <h2 className="text-center text-xs font-extrabold uppercase tracking-[0.11em] text-[#6b8588]">Featured</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {featured.map((a) => (
              <Link
                key={a.slug}
                href={`/help/${a.slug}`}
                className="rounded-2xl border border-white/60 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--cp-teal)]">{a.category}</p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--cp-navy)]">{a.title}</h3>
                <p className="mt-2 text-sm text-[var(--cp-muted)]">{a.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 text-center">
        <p className="text-sm text-[var(--cp-muted)]">Still stuck after the guides?</p>
        <Button href="/contact" className="mt-4 bg-[var(--cp-teal)] px-8 py-3.5 font-semibold hover:bg-[var(--cp-teal-600)]">
          Contact support →
        </Button>
      </section>
    </>
  );
}
