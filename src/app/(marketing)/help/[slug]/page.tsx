import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { HELP_ARTICLES, HELP_SLUGS } from "@/lib/content/help-articles";
import { ProductScreenshot } from "@/components/marketing/product-screenshot";
import { Button } from "@/components/ui/button";

export function generateStaticParams() {
  return HELP_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = HELP_ARTICLES[slug];
  if (!article) return {};
  return { title: article.title, description: article.summary };
}

export default async function HelpArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = HELP_ARTICLES[slug];
  if (!article) notFound();

  const related = article.relatedSlugs.map((s) => HELP_ARTICLES[s]).filter(Boolean);

  return (
    <>
      <div className="border-b border-[var(--cp-border)] bg-[var(--cp-bg)] py-4">
        <div className="mx-auto max-w-3xl px-4">
          <nav className="text-sm text-[var(--cp-muted)]" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--cp-teal)]">
              Home
            </Link>
            <span className="mx-2 text-[#bcc8cb]" aria-hidden>
              /
            </span>
            <Link href="/help" className="hover:text-[var(--cp-teal)]">
              Help centre
            </Link>
            <span className="mx-2 text-[#bcc8cb]" aria-hidden>
              /
            </span>
            <span className="text-[var(--cp-navy)]">{article.title}</span>
          </nav>
        </div>
      </div>

      <header className="border-b border-[var(--cp-border)] bg-[var(--cp-hero-gradient)] py-[clamp(2.5rem,6vw,3.75rem)]">
        <div className="mx-auto max-w-3xl px-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.11em] text-[var(--cp-teal)]">{article.category}</p>
          <h1 className="mt-4 text-[clamp(1.85rem,3.2vw,2.5rem)] font-semibold leading-tight tracking-tight text-[var(--cp-navy)]">{article.title}</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-[var(--cp-muted)]">{article.summary}</p>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-12">
        <ol className="list-decimal space-y-4 pl-5 text-[17px] leading-relaxed text-[var(--cp-muted)]">
          {article.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>

        {article.screenshotKey ? (
          <div className="mt-12 border-t border-[var(--cp-border)] pt-10">
            <h2 className="text-lg font-semibold text-[var(--cp-navy)]">In the product</h2>
            <p className="mt-2 text-sm text-[var(--cp-muted)]">Screenshot from a demo organisation with sample data.</p>
            <ProductScreenshot screenshotKey={article.screenshotKey} className="mt-6" />
          </div>
        ) : null}

        {related.length ? (
          <div className="mt-12 border-t border-[var(--cp-border)] pt-10">
            <h2 className="text-lg font-semibold text-[var(--cp-navy)]">Related articles</h2>
            <ul className="mt-4 space-y-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/help/${r.slug}`} className="text-[15px] font-semibold text-[#07878a] hover:underline">
                    {r.title} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-12 rounded-2xl border border-[#e3ebed] bg-[var(--cp-section-muted)] p-8 text-center">
          <p className="text-sm text-[var(--cp-muted)]">Need a human?</p>
          <Button href="/contact" className="mt-4 bg-[var(--cp-teal)] px-6 py-3 font-semibold hover:bg-[var(--cp-teal-600)]">
            Contact support →
          </Button>
        </div>
      </article>
    </>
  );
}
