import Link from "next/link";
import { businessIdentity } from "@/lib/config/business-identity";
import type { LegalDocument } from "@/lib/content/legal-documents";
import { footerColumns } from "@/lib/marketing/navigation";
import { PUBLIC_LEGAL_PATHS } from "@/lib/marketing/legal-routes";

export function LegalDocumentView({
  document,
  currentPath,
}: {
  document: LegalDocument;
  /** e.g. "/privacy-policy", for active nav highlight */
  currentPath: string;
}) {
  const navItems = PUBLIC_LEGAL_PATHS.map((slug) => ({
    href: `/${slug}`,
    label: footerColumns.legal.find((l) => l.href === `/${slug}`)?.label ?? slug,
  }));

  return (
    <div className="border-b border-[var(--cp-border)] bg-[var(--cp-bg)] py-[clamp(2.5rem,5vw,3.5rem)]">
      <div className="mx-auto max-w-[1216px] px-4">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] xl:gap-14">
          <aside className="lg:sticky lg:top-28">
            <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#6b8588]">Legal</p>
            <nav className="mt-4 flex flex-col gap-1" aria-label="Legal documents">
              {navItems.map((item) => {
                const active = item.href === currentPath;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-[var(--cp-teal)]/10 text-[var(--cp-navy)] ring-1 ring-[var(--cp-teal)]/30"
                        : "text-[var(--cp-muted)] hover:bg-white hover:text-[var(--cp-navy)]"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <p className="mt-8 text-xs leading-relaxed text-[var(--cp-ink-subtle)]">
              Effective {businessIdentity.legalEffectiveDate} · Updated {businessIdentity.legalLastUpdated}
            </p>
          </aside>

          <div className="min-w-0">
            <article>
              <h1 className="text-[clamp(1.85rem,3vw,2.5rem)] font-semibold tracking-tight text-[var(--cp-navy)]">{document.title}</h1>
              {document.sections.length > 2 ? (
                <nav aria-label="On this page" className="mt-8 rounded-xl border border-[var(--cp-border)] bg-white p-5">
                  <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#6b8588]">On this page</p>
                  <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-[var(--cp-muted)]">
                    {document.sections.map((s) => (
                      <li key={s.id}>
                        <a href={`#${s.id}`} className="font-medium text-[#07878a] hover:underline">
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : null}

              <div className="prose prose-slate mt-10 max-w-[min(100%,42rem)] space-y-10">
                {document.sections.map((s) => (
                  <section key={s.id} id={s.id}>
                    <h2 className="text-xl font-semibold text-[var(--cp-navy)]">{s.title}</h2>
                    {s.paragraphs.map((p) => (
                      <p key={p} className="mt-3 text-[17px] leading-relaxed text-[var(--cp-muted)]">
                        {p}
                      </p>
                    ))}
                  </section>
                ))}
              </div>
            </article>

            <div className="mt-12 border-t border-[var(--cp-border)] pt-8">
              <p className="text-sm font-medium text-[var(--cp-navy)]">Related policies</p>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {footerColumns.legal.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={`${
                        l.href === currentPath ? "font-semibold text-[var(--cp-navy)]" : "text-[var(--cp-teal)]"
                      } hover:underline`}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
