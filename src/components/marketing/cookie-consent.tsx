"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "cleanproof_cookie_prefs";

type Prefs = { essential: true; analytics: boolean; decidedAt: string };

export function CookieConsent() {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [showPrefs, setShowPrefs] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Prefs) : null;
      queueMicrotask(() => setPrefs(parsed));
    } catch {
      queueMicrotask(() => setPrefs(null));
    }
  }, []);

  function save(analytics: boolean) {
    const next: Prefs = { essential: true, analytics, decidedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setPrefs(next);
    setShowPrefs(false);
  }

  if (prefs && !showPrefs) {
    return (
      <button
        type="button"
        className="fixed bottom-4 left-4 z-50 rounded-full border border-[var(--cp-border)] bg-white px-3 py-1.5 text-xs text-[var(--cp-muted)] shadow-sm hover:text-[var(--cp-teal)]"
        onClick={() => setShowPrefs(true)}
      >
        Cookie preferences
      </button>
    );
  }

  if (prefs && showPrefs) {
    return (
      <div className="fixed bottom-4 left-4 z-50 max-w-sm rounded-xl border border-[var(--cp-border)] bg-white p-4 shadow-lg">
        <p className="text-sm font-medium text-[var(--cp-navy)]">Cookie preferences</p>
        <p className="mt-2 text-xs text-[var(--cp-muted)]">Essential cookies are always on. Analytics are optional and not loaded today.</p>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={prefs.analytics} onChange={(e) => save(e.target.checked)} />
          Allow analytics cookies (none loaded yet)
        </label>
        <button type="button" className="mt-3 text-xs text-[var(--cp-teal)]" onClick={() => setShowPrefs(false)}>
          Close
        </button>
      </div>
    );
  }

  if (!prefs) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--cp-border)] bg-white px-4 py-3 shadow-lg md:inset-x-auto md:bottom-4 md:left-4 md:max-w-md md:rounded-xl md:border">
        <p className="text-[13px] leading-snug text-[var(--cp-navy)] md:text-sm">
          We only use essential cookies unless you opt in to analytics.{" "}
          <Link href="/cookie-policy" className="text-[var(--cp-teal)] underline">
            Cookie policy
          </Link>
        </p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            className="rounded-lg bg-[var(--cp-navy)] px-3 py-1.5 text-sm text-white"
            onClick={() => save(false)}
          >
            Accept essential only
          </button>
          <button type="button" className="rounded-lg border border-[var(--cp-border)] px-3 py-1.5 text-sm" onClick={() => save(true)}>
            Allow analytics
          </button>
        </div>
      </div>
    );
  }

  return null;
}
