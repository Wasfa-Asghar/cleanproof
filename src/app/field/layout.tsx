import Link from "next/link";
import { redirect } from "next/navigation";
import { FieldConnectionStatus } from "@/components/field/field-connection-status";
import { getSession } from "@/lib/auth/session";

export const instant = false;

export default async function FieldLayout({ children }: LayoutProps<"/field">) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-[var(--cp-bg)] pb-24 antialiased sm:max-w-xl">
      <header className="sticky top-0 z-20 border-b border-[var(--cp-border)] bg-[var(--cp-surface)]/95 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-[var(--cp-surface)]/90">
        <div className="flex items-center justify-between gap-3">
          <Link href="/field/today" className="text-lg font-semibold tracking-tight text-[var(--cp-navy)]">
            Field
          </Link>
          <FieldConnectionStatus />
        </div>
      </header>
      <main className="px-4 py-4">{children}</main>
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--cp-border)] bg-[var(--cp-surface)] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(11,37,58,0.06)]"
        aria-label="Field navigation"
      >
        <div className="mx-auto flex max-w-xl justify-around">
          <Link
            href="/field/today"
            className="flex min-h-[3.25rem] min-w-[4.5rem] flex-1 flex-col items-center justify-center px-3 text-xs font-semibold text-[var(--cp-navy)] active:bg-[var(--cp-section-muted)]"
          >
            Today
          </Link>
          <Link
            href="/app/my-jobs"
            className="flex min-h-[3.25rem] min-w-[4.5rem] flex-1 flex-col items-center justify-center px-3 text-xs font-semibold text-[var(--cp-muted)] active:bg-[var(--cp-section-muted)]"
          >
            My jobs
          </Link>
        </div>
      </nav>
    </div>
  );
}
