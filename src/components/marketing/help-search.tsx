"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarketingInteriorHeroCenter } from "@/components/marketing/marketing-interior-hero";
import { MarketingInteriorShell } from "@/components/marketing/marketing-interior-shell";
import { SectionIntro } from "@/components/marketing/section-intro";
import type { HelpArticle, HelpCategory } from "@/lib/content/help-articles";
import {
  IconAudit,
  IconCamera,
  IconChecklist,
  IconStatus,
  IconTokenLink,
  IconLockSession,
} from "@/components/marketing/marketing-icons";

const CATEGORY_ICON: Record<HelpCategory, typeof IconChecklist> = {
  "Getting started": IconChecklist,
  Operations: IconStatus,
  Field: IconCamera,
  "Quality & evidence": IconAudit,
  "Client reporting": IconTokenLink,
  "Billing & account": IconLockSession,
};

export function HelpCentreView({
  articles,
  categories,
  featured,
}: {
  articles: HelpArticle[];
  categories: HelpCategory[];
  featured: HelpArticle[];
}) {
  const [q, setQ] = useState("");
  const norm = q.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!norm) return articles;
    return articles.filter((a) => {
      const hay = `${a.title} ${a.summary} ${a.searchText} ${a.category}`.toLowerCase();
      return hay.includes(norm);
    });
  }, [articles, norm]);

  const byCategory = useMemo(() => {
    const m = new Map<HelpCategory, HelpArticle[]>();
    for (const c of categories) m.set(c, []);
    for (const a of filtered) {
      const list = m.get(a.category);
      if (list) list.push(a);
    }
    return m;
  }, [filtered, categories]);

  return (
    <>
      <MarketingInteriorHeroCenter
        eyebrow="Resources"
        title="Help centre"
        lead="Guides for jobs, field work, evidence, reviews, reports, and billing. Search stays on this device."
      >
        <div className="relative mx-auto mt-8 w-full max-w-xl">
          <label htmlFor="help-search" className="sr-only">
            Search help articles
          </label>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--cp-ink-subtle)]" aria-hidden>
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
              <path d="M14 14l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          <input
            id="help-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search guides (jobs, billing, photos…)"
            className="block w-full rounded-xl border border-[var(--cp-border-strong)] bg-[var(--cp-surface)] py-3.5 pl-11 pr-4 text-[15px] text-[var(--cp-navy)] shadow-sm placeholder:text-[#8fa4a8] focus:border-[var(--cp-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--cp-teal)]/20"
            autoComplete="off"
          />
        </div>
      </MarketingInteriorHeroCenter>

      <MarketingInteriorShell>
        {!norm ? (
          <section data-design="focus" className="!bg-[var(--cp-surface)]">
            <div className="mx-auto px-4">
              <SectionIntro
                tone="quiet"
                eyebrow="Start here"
                title="Featured guides"
                description="The three guides most teams open first when they are setting up CleanProof."
              />
              <div className="marketing-interior-focus-grid mt-12">
                {featured.map((a, index) => (
                  <Link key={a.slug} href={`/help/${a.slug}`} className="marketing-interior-focus-card group">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--cp-border)] bg-[var(--cp-surface-soft)] text-sm font-extrabold tabular-nums text-[var(--cp-teal)]">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--cp-ink-subtle)]">{a.category}</p>
                    <h3 className="!mt-2 transition-colors group-hover:text-[var(--cp-teal)]">{a.title}.</h3>
                    <p>{a.summary}</p>
                    <span className="mt-4 inline-block text-sm font-medium text-[var(--cp-teal)]">Read guide →</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section data-design="verify">
          <div className="mx-auto px-4">
            <SectionIntro
              tone="quiet"
              eyebrow="Browse by topic"
              title={norm ? "Search results" : "All help guides"}
              description={
                norm
                  ? `Showing guides that match “${q.trim()}”.`
                  : "Jump into the area that matches what you are doing in CleanProof right now."
              }
            />
            <div className="mt-12 space-y-12">
              {norm && !filtered.length ? (
                <p className="text-sm text-[var(--cp-muted)]">No guides match. Try fewer words or clear the search.</p>
              ) : (
                categories.map((cat) => {
                  const list = byCategory.get(cat) ?? [];
                  if (!list.length) return null;
                  const Icon = CATEGORY_ICON[cat];
                  return (
                    <div key={cat}>
                      <div className="mb-5 flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--cp-border)] bg-[var(--cp-surface)]">
                          <Icon className="h-5 w-5 text-[var(--cp-navy)]" />
                        </span>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--cp-ink-subtle)]">{cat}</h3>
                      </div>
                      <div className="marketing-interior-unified-grid grid sm:grid-cols-2">
                        {list.map((a) => (
                          <Link
                            key={a.slug}
                            href={`/help/${a.slug}`}
                            className="group block transition-colors hover:bg-[var(--cp-surface-soft)]"
                          >
                            <h4 className="font-semibold tracking-tight text-[var(--cp-navy)] group-hover:text-[var(--cp-teal)]">{a.title}</h4>
                            <p className="marketing-prose mt-2 text-sm text-[var(--cp-muted)]">{a.summary}</p>
                            <span className="mt-4 inline-block text-sm font-medium text-[var(--cp-teal)]">Read guide →</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section data-design="workflow">
          <div className="mx-auto max-w-6xl px-4">
            <div className="rounded-xl border border-[var(--cp-border)] bg-[var(--cp-surface)] px-6 py-8 sm:px-8 sm:py-10 md:flex md:items-center md:justify-between md:gap-8">
              <div className="max-w-xl">
                <p className="text-sm font-medium text-[var(--cp-muted)]">Still stuck?</p>
                <h2 className="mt-2 text-2xl font-medium tracking-[-0.02em] text-[var(--cp-navy)] md:text-[1.85rem]">
                  Talk to the CleanProof team.
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--cp-muted)]">
                  If a guide does not cover your case, send a short note and we will point you to the right next step.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 md:mt-0 md:shrink-0">
                <Button href="/contact" className="bg-[var(--cp-teal)] px-[22px] py-3.5 text-sm font-semibold shadow-sm hover:bg-[var(--cp-teal-600)]">
                  Contact support →
                </Button>
                <Button href="/demo" variant="secondary" className="border-[var(--cp-border-strong)] px-[22px] py-3.5 text-sm font-semibold shadow-sm">
                  Explore demo ↗
                </Button>
              </div>
            </div>
          </div>
        </section>
      </MarketingInteriorShell>
    </>
  );
}
