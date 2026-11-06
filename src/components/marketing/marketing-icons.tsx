/** Simple line icons for marketing sections, scalable, on-brand. */

import type { SVGProps } from "react";

export function IconChecklist(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="1.5" className="text-[var(--cp-border)]" />
      <path d="M9 11h8M9 16h8M9 21h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-slate-400" />
      <path d="M22 11l-2.5 2.5L17 11" stroke="var(--cp-teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCamera(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <rect x="4" y="9" width="24" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" className="text-slate-400" />
      <circle cx="16" cy="17" r="4.5" stroke="var(--cp-teal)" strokeWidth="1.5" />
      <path d="M12 9V8a2 2 0 012-2h4a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-slate-400" />
    </svg>
  );
}

export function IconAlert(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M16 6l12 20H4L16 6z" stroke="var(--cp-teal)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M16 13v5M16 21h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-slate-600" />
    </svg>
  );
}

export function IconStatus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" className="text-[var(--cp-border)]" />
      <path d="M10 16l4 4 8-9" stroke="var(--cp-teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconBuilding(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M8 28V10l8-4 8 4v18" stroke="var(--cp-teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 28V18h8v10" stroke="currentColor" strokeWidth="1.5" className="text-slate-500" />
      <path d="M14 22h4M14 26h4" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
    </svg>
  );
}

export function IconOffice(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <rect x="5" y="8" width="22" height="20" rx="2" stroke="var(--cp-teal)" strokeWidth="1.5" />
      <path d="M5 14h22M11 14v14M16 14v14M21 14v14" stroke="currentColor" strokeWidth="1.2" className="text-slate-400" />
    </svg>
  );
}

export function IconKey(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <circle cx="12" cy="18" r="5" stroke="var(--cp-teal)" strokeWidth="1.5" />
      <path d="M16 14l10-6v4l-4 2v4l-3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500" />
    </svg>
  );
}

export function IconHome(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M6 16l10-9 10 9v12a2 2 0 01-2 2h-5v-8H13v8H8a2 2 0 01-2-2V16z" stroke="var(--cp-teal)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** Role-based access, shield with person */
export function IconShieldUser(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path
        d="M16 4l10 4v8c0 6-4.2 10.8-10 12-5.8-1.2-10-6-10-12V8l10-4z"
        stroke="var(--cp-teal)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="15" r="3" stroke="currentColor" strokeWidth="1.4" className="text-slate-600" />
      <path d="M11.5 22c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="text-slate-600" />
    </svg>
  );
}

/** Organisation-scoped data */
export function IconOrgScope(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <rect x="5" y="6" width="22" height="20" rx="2" stroke="var(--cp-teal)" strokeWidth="1.5" />
      <path d="M5 12h22M11 6v20" stroke="currentColor" strokeWidth="1.2" className="text-slate-400" />
      <circle cx="19" cy="20" r="2.5" stroke="var(--cp-teal)" strokeWidth="1.4" />
    </svg>
  );
}

/** Share link / token */
export function IconTokenLink(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path
        d="M13 10a4 4 0 015.7 0l1.2 1.2a4 4 0 010 5.6M19 22a4 4 0 01-5.6 0l-1.2-1.2a4 4 0 010-5.6"
        stroke="var(--cp-teal)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M12 16h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-slate-500" />
    </svg>
  );
}

/** Session / lock */
export function IconLockSession(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <rect x="9" y="14" width="14" height="13" rx="2" stroke="var(--cp-teal)" strokeWidth="1.5" />
      <path
        d="M11 14V12a5 5 0 0110 0v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-slate-500"
      />
      <circle cx="16" cy="21" r="1.5" fill="var(--cp-teal)" />
    </svg>
  );
}

/** Audit trail */
export function IconAudit(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M8 6h14l2 4v18a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="var(--cp-teal)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 13h12M10 18h8M10 23h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="text-slate-400" />
    </svg>
  );
}
