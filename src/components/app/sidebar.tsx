"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  ListTodo,
  ShieldAlert,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { logoutAction } from "@/lib/auth/actions";
import { businessIdentity } from "@/lib/config/business-identity";

const nav = [
  { href: "/app/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/app/jobs", label: "Jobs", icon: ListTodo },
  { href: "/app/my-jobs", label: "My jobs", icon: ClipboardList },
  { href: "/app/sites", label: "Clients & sites", icon: Building2 },
  { href: "/app/templates", label: "Checklists", icon: ClipboardCheck },
  { href: "/app/quality", label: "Quality queue", icon: ShieldAlert },
  { href: "/app/issues", label: "Issues", icon: FileText },
  { href: "/app/reports", label: "Reports", icon: FileText },
  { href: "/app/team", label: "Team", icon: Users },
  { href: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/app/settings/general", label: "Settings", icon: CreditCard },
  { href: "/app/settings/import", label: "Import CSV", icon: FileText },
  { href: "/app/settings/export", label: "Export CSV", icon: FileText },
  { href: "/app/settings/notifications", label: "Notifications", icon: FileText },
  { href: "/app/settings/billing", label: "Billing", icon: CreditCard },
];

export function AppSidebar({ orgName }: { orgName: string }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--cp-border-strong)] bg-[#0a1f2e] text-slate-100 lg:flex">
      <div className="border-b border-white/10 px-4 py-5">
        <Link href="/app/overview" className="block" aria-label={businessIdentity.brandPresentation}>
          <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-slate-400">
            {businessIdentity.brandPresenter}
          </span>
          <span className="mt-0.5 block text-lg font-semibold tracking-tight text-white">
            {businessIdentity.tradingName}
          </span>
        </Link>
        <p className="mt-1 truncate text-xs text-slate-400">{orgName}</p>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm transition-colors",
                active ? "bg-[var(--cp-teal)] font-medium text-white shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <form action={logoutAction} className="border-t border-white/10 p-3">
        <button
          type="submit"
          className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          Sign out
        </button>
      </form>
    </aside>
  );
}
