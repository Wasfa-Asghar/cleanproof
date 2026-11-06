"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingWordmark } from "@/components/marketing/marketing-wordmark";
import {
  featureNavLinks,
  industryNavLinks,
  productLinks,
  resourceLinks,
  type NavLink,
} from "@/lib/marketing/navigation";

type MenuKey = "product" | "industries" | "resources";

type NavItem =
  | { kind: "link"; href: string; label: string }
  | { kind: "menu"; key: MenuKey; label: string; href: string; groups: Array<{ heading?: string; links: NavLink[] }> };

const NAV: NavItem[] = [
  {
    kind: "menu",
    key: "product",
    label: "Product",
    href: "/features",
    groups: [
      { heading: "Capabilities", links: featureNavLinks },
      { heading: "Explore", links: productLinks.filter((l) => l.href !== "/pricing") },
    ],
  },
  {
    kind: "menu",
    key: "industries",
    label: "Industries",
    href: "/industries",
    groups: [{ links: industryNavLinks }],
  },
  { kind: "link", href: "/how-it-works", label: "How it works" },
  { kind: "link", href: "/pricing", label: "Pricing" },
  {
    kind: "menu",
    key: "resources",
    label: "Resources",
    href: "/help",
    groups: [{ links: resourceLinks }],
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const baseItem =
  "inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors";
const idleItem = "text-[var(--cp-navy)] hover:bg-[var(--cp-surface-soft)] hover:text-[var(--cp-teal)]";
const activeItem = "bg-[color-mix(in_srgb,var(--cp-teal)_9%,white)] text-[var(--cp-teal)]";

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const [mobileSection, setMobileSection] = useState<MenuKey | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  /* Close every menu when the route changes (reset during render, not in an effect). */
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
    setOpenMenu(null);
    setMobileSection(null);
  }

  /* Escape closes menus, outside click closes the desktop dropdown. */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    }
    function onClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  /* Lock page scroll while the mobile menu is open. */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function openNow(key: MenuKey) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(key);
  }
  function closeSoon() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#ebeff0] bg-white/90 shadow-[0_1px_0_0_rgba(12,25,41,0.04)] backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between gap-4 px-4 md:h-[76px] md:px-6">
        <MarketingWordmark />

        <nav ref={navRef} className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((item) => {
            if (item.kind === "link") {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`${baseItem} ${active ? activeItem : idleItem}`}
                >
                  {item.label}
                </Link>
              );
            }
            const active = isActive(pathname, item.href) || item.groups.some((g) => g.links.some((l) => isActive(pathname, l.href)));
            const open = openMenu === item.key;
            return (
              <div
                key={item.key}
                className="relative"
                onMouseEnter={() => openNow(item.key)}
                onMouseLeave={closeSoon}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpenMenu(null);
                }}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  aria-haspopup="true"
                  onClick={() => setOpenMenu(open ? null : item.key)}
                  className={`${baseItem} ${active || open ? activeItem : idleItem}`}
                >
                  {item.label}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
                </button>
                {open ? (
                  <div className="absolute left-0 top-full z-50 pt-2">
                    <div
                      className={`rounded-2xl border border-[var(--cp-border)] bg-white p-3 shadow-[0_18px_44px_rgba(18,44,53,0.14)] ${
                        item.groups.length > 1 ? "grid w-[540px] grid-cols-2 gap-2" : "w-[260px]"
                      }`}
                    >
                      {item.groups.map((g, gi) => (
                        <div key={gi}>
                          {g.heading ? (
                            <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-ink-subtle)]">
                              {g.heading}
                            </p>
                          ) : null}
                          <ul>
                            {g.links.map((l) => (
                              <li key={l.href}>
                                <Link
                                  href={l.href}
                                  aria-current={pathname === l.href ? "page" : undefined}
                                  className={`block rounded-lg px-3 py-2 text-sm hover:bg-[var(--cp-surface-soft)] ${
                                    pathname === l.href ? "font-semibold text-[var(--cp-teal)]" : "font-medium text-[var(--cp-navy)]"
                                  }`}
                                >
                                  {l.label}
                                  {l.description ? (
                                    <span className="mt-0.5 block text-xs font-normal text-[var(--cp-muted)]">{l.description}</span>
                                  ) : null}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/auth/login"
            className="whitespace-nowrap text-sm font-semibold text-[var(--cp-navy)] transition-colors hover:text-[var(--cp-teal)]"
          >
            Log in
          </Link>
          <Button
            href="/auth/signup"
            className="bg-[var(--cp-teal)] px-[17px] py-2.5 text-sm font-semibold shadow-[0_7px_16px_rgba(4,123,132,0.12)] hover:bg-[var(--cp-teal-600)]"
          >
            Start free trial
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--cp-border)] lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <nav
          className="max-h-[calc(100dvh-68px)] overflow-y-auto border-t border-[var(--cp-border)] bg-white px-4 pb-6 pt-3 lg:hidden"
          aria-label="Mobile"
        >
          <ul className="text-[15px]">
            {NAV.map((item) => {
              if (item.kind === "link") {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href} className="border-b border-[var(--cp-border)]/70">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-12 items-center font-medium ${active ? "text-[var(--cp-teal)]" : "text-[var(--cp-navy)]"}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }
              const expanded = mobileSection === item.key;
              return (
                <li key={item.key} className="border-b border-[var(--cp-border)]/70">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setMobileSection(expanded ? null : item.key)}
                    className="flex min-h-12 w-full items-center justify-between font-medium text-[var(--cp-navy)]"
                  >
                    {item.label}
                    <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                  {expanded ? (
                    <ul className="pb-3 pl-3">
                      <li>
                        <Link href={item.href} className="block rounded-lg py-2 text-sm font-semibold text-[var(--cp-teal)]">
                          {item.key === "resources" ? "Help centre" : `All ${item.label.toLowerCase()}`}
                        </Link>
                      </li>
                      {item.groups
                        .flatMap((g) => g.links)
                        .filter((l) => l.href !== item.href)
                        .map((l) => (
                          <li key={l.href}>
                            <Link href={l.href} className="block rounded-lg py-2 text-sm text-[var(--cp-navy)]">
                              {l.label}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
            <li className="border-b border-[var(--cp-border)]/70">
              <Link href="/demo" className="flex min-h-12 items-center font-medium text-[var(--cp-navy)]">
                Interactive demo
              </Link>
            </li>
            <li className="flex flex-col gap-2 pt-5">
              <Button href="/auth/login" variant="secondary" className="w-full">
                Log in
              </Button>
              <Button href="/auth/signup" className="w-full bg-[var(--cp-teal)] hover:bg-[var(--cp-teal-600)]">
                Start free trial
              </Button>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
