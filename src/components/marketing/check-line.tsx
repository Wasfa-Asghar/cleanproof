import type { ReactNode } from "react";

/** Single-line benefit, avoids generic “•” bullet lists in hero CTAs. */
export function CheckLine({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-sm leading-snug text-[var(--cp-navy)]">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--cp-teal)_12%,transparent)] text-[var(--cp-teal)]">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span>{children}</span>
    </li>
  );
}
