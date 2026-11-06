import { MarketingWordmark } from "@/components/marketing/marketing-wordmark";

export const instant = false;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--cp-bg)]">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <aside className="relative hidden overflow-hidden border-r border-[var(--cp-border)] bg-[var(--cp-hero-gradient)] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(12,152,151,0.14),transparent_50%)]" aria-hidden />
          <div className="relative flex h-full flex-col justify-between px-12 py-12 xl:px-16">
            <MarketingWordmark href="/" className="w-fit" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--cp-teal)]">Cleaning quality platform</p>
              <h2 className="mt-4 max-w-sm text-2xl font-semibold leading-snug tracking-tight text-[var(--cp-navy)]">Checklists, evidence, and supervisor review on one job record.</h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--cp-muted)]">Built for owners, supervisors, and field cleaners, tenant-scoped. Every customer keeps their data separate.</p>
            </div>
            <p className="text-xs text-[var(--cp-ink-subtle)]">Need help? See the help centre or contact page from the marketing site.</p>
          </div>
        </aside>
        <main className="flex flex-col">
          <div className="border-b border-[var(--cp-border)] bg-white px-4 py-4 lg:hidden">
            <MarketingWordmark href="/" />
          </div>
          <div className="flex flex-1 flex-col px-4 py-10 sm:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
