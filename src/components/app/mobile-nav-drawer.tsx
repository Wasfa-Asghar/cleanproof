"use client";

import { useState } from "react";
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
  Menu,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

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
  { href: "/app/settings/billing", label: "Billing", icon: CreditCard },
];

export function MobileNavDrawer({ orgName }: { orgName: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 lg:hidden">
      <button
        type="button"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--cp-border)] bg-white text-[var(--cp-navy)] shadow-sm"
        aria-expanded={open}
        aria-controls="app-mobile-nav"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
      </button>
      {open ? (
        <>
          <button type="button" className="fixed inset-0 z-40 bg-black/40 lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)} />
          <nav
            id="app-mobile-nav"
            className="fixed inset-y-0 left-0 z-50 w-[min(100vw-3rem,18rem)] overflow-y-auto border-r border-[var(--cp-border-strong)] bg-[#0a1f2e] px-3 py-4 text-slate-100 shadow-xl lg:hidden"
          >
            <p className="truncate border-b border-white/10 px-2 pb-3 text-xs font-medium text-white/80">{orgName}</p>
            <ul className="mt-3 space-y-0.5">
              {nav.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm transition-colors",
                        active ? "bg-[var(--cp-teal)] text-white" : "text-slate-300 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </>
      ) : null}
    </div>
  );
}
