"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MobileNavDrawer } from "@/components/app/mobile-nav-drawer";

function segmentTitle(segment: string): string {
  const map: Record<string, string> = {
    app: "App",
    overview: "Overview",
    jobs: "Jobs",
    quality: "Quality queue",
    issues: "Issues",
    reports: "Reports",
    sites: "Clients & sites",
    templates: "Checklists",
    team: "Team",
    analytics: "Analytics",
    settings: "Settings",
    billing: "Billing",
    general: "General",
    import: "Import",
    export: "Export",
    notifications: "Notifications",
    my: "My jobs",
  };
  if (/^[0-9a-f-]{20,}$/i.test(segment)) return "Detail";
  return map[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

export function AppTopBar({
  orgName,
  roleLabel,
  children,
}: {
  orgName: string;
  roleLabel: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { href: string; label: string }[] = [];
  if (parts[0] === "app") {
    let acc = "";
    for (let i = 0; i < parts.length; i++) {
      acc += `/${parts[i]}`;
      if (i === 0) continue;
      const label = segmentTitle(parts[i]);
      crumbs.push({ href: acc, label });
    }
  }

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--cp-border)] bg-[var(--cp-surface)] px-4 py-3 text-sm shadow-sm sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <MobileNavDrawer orgName={orgName} />
        <div className="min-w-0 flex-1">
          <nav aria-label="Breadcrumb" className="hidden text-xs text-[var(--cp-muted)] md:block">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/app/overview" className="font-medium text-[var(--cp-navy)] hover:text-[var(--cp-teal)]">
                  {orgName}
                </Link>
              </li>
              {crumbs.map((c, idx) => (
                <li key={c.href} className="flex items-center gap-1">
                  <span className="text-[var(--cp-ink-subtle)]" aria-hidden>
                    /
                  </span>
                  {idx === crumbs.length - 1 ? (
                    <span className="font-medium text-[var(--cp-navy)]">{c.label}</span>
                  ) : (
                    <Link href={c.href} className="hover:text-[var(--cp-teal)]">
                      {c.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <p className="truncate text-xs text-[var(--cp-muted)] md:hidden">
            <span className="font-medium text-[var(--cp-navy)]">{orgName}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-[var(--cp-muted)] sm:inline">
          Signed in as <span className="font-semibold capitalize text-[var(--cp-navy)]">{roleLabel}</span>
        </span>
        {children}
      </div>
    </header>
  );
}
