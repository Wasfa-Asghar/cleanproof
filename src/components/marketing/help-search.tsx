"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { HelpArticle, HelpCategory } from "@/lib/content/help-articles";

export function HelpSearch({
  articles,
  categories,
}: {
  articles: HelpArticle[];
  categories: HelpCategory[];
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
    <div>
      <label htmlFor="help-search" className="sr-only">
        Search help articles
      </label>
      <input
        id="help-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search guides (jobs, billing, photos…)"
        className="mx-auto mt-8 block w-full max-w-xl rounded-xl border border-[var(--cp-border)] bg-white px-4 py-3 text-[15px] text-[var(--cp-navy)] shadow-sm placeholder:text-[#8fa4a8] focus:border-[var(--cp-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--cp-teal)]/25"
        autoComplete="off"
      />
      <div className="mt-10 space-y-10">
        {categories.map((cat) => {
          const list = byCategory.get(cat) ?? [];
          if (!list.length) return null;
          return (
            <section key={cat}>
              <h2 className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#6b8588]">{cat}</h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {list.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/help/${a.slug}`}
                      className="block rounded-2xl border border-[#e3ebed] bg-white p-6 shadow-[0_6px_20px_rgba(35,60,74,0.02)] transition-colors hover:border-[var(--cp-teal)]"
                    >
                      <h3 className="font-semibold text-[var(--cp-navy)]">{a.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--cp-muted)]">{a.summary}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      {norm && !filtered.length ? (
        <p className="mt-8 text-center text-sm text-[var(--cp-muted)]">No guides match “{q.trim()}”. Try fewer words or browse by category below.</p>
      ) : null}
    </div>
  );
}
