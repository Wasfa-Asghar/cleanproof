"use client";

import Image from "next/image";
import { useState } from "react";
import { PRODUCT_SCREENSHOTS } from "@/lib/marketing/image-manifest";

const TABS: Array<{
  id: string;
  label: string;
  blurb: string;
  points: string[];
}> = [
  {
    id: "owner",
    label: "Owner dashboard",
    blurb: "Monitor jobs awaiting review, open issues, and subscription usage from one overview, no guessing what needs attention.",
    points: ["Jobs in review", "Open issues", "Plan usage"],
  },
  {
    id: "cleaner",
    label: "Cleaner workspace",
    blurb: "Cleaners work in the mobile browser: checklists, before/after photos, and a clear path to submit for review.",
    points: ["Template checklist", "Photo capture", "Submit for review"],
  },
  {
    id: "photos",
    label: "Photo evidence",
    blurb: "Before and after photos stay on the job record so supervisors and clients see the same evidence chain.",
    points: ["Before set", "After set", "Linked to visit"],
  },
  {
    id: "quality",
    label: "Quality review",
    blurb: "Supervisors approve, send back for more photos, or reject from a single queue built for daily ops.",
    points: ["Queue by site", "Thumbnails", "Approve / return"],
  },
  {
    id: "reports",
    label: "Client reports",
    blurb: "Approved jobs publish read-only completion views and PDFs clients open from a secure link, no dashboard login.",
    points: ["Approved only", "Secure link", "PDF export"],
  },
];

const SHOTS: Record<string, { key: keyof typeof PRODUCT_SCREENSHOTS; portrait?: boolean }> = {
  owner: { key: "owner-overview" },
  cleaner: { key: "field-workspace-mobile", portrait: true },
  photos: { key: "job-detail" },
  quality: { key: "quality-queue" },
  reports: { key: "client-report" },
};

function PreviewVisual({ id }: { id: string }) {
  const { key, portrait } = SHOTS[id] ?? SHOTS.owner;
  const shot = PRODUCT_SCREENSHOTS[key];
  if (portrait) {
    return (
      <div className="mx-auto max-w-[240px] overflow-hidden rounded-[1.6rem] border-[6px] border-[var(--cp-navy)] bg-white shadow-xl shadow-slate-900/20">
        <Image src={shot.file} alt={shot.alt} width={390} height={844} className="h-auto w-full" sizes="240px" />
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--cp-border)] bg-white shadow-lg shadow-slate-900/10 ring-1 ring-[var(--cp-ring)]">
      <Image src={shot.file} alt={shot.alt} width={1280} height={800} className="h-auto w-full" sizes="(max-width: 1024px) 100vw, 600px" />
    </div>
  );
}

export function ProductPreviewTabs() {
  const [active, setActive] = useState(TABS[0].id);
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <div className="marketing-product-tabs rounded-2xl border border-[var(--cp-border)] bg-gradient-to-b from-[var(--cp-surface)] to-[var(--cp-bg)] p-5 shadow-sm ring-1 ring-[var(--cp-ring)] md:p-8">
      <div role="tablist" aria-label="Product preview" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors motion-reduce:transition-none ${
              active === t.id
                ? "bg-[var(--cp-navy)] text-white shadow-md shadow-slate-900/15"
                : "bg-white text-[var(--cp-navy)] ring-1 ring-[var(--cp-border)] hover:bg-slate-50"
            }`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        key={tab.id}
        role="tabpanel"
        aria-labelledby={tab.id}
        className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10"
      >
        <div className="min-w-0">
          <PreviewVisual id={tab.id} />
          <p className="mt-3 text-center text-xs text-slate-400 lg:text-left">Real CleanProof screens from the demo organisation.</p>
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-base leading-relaxed text-[var(--cp-muted)]">{tab.blurb}</p>
          <ul className="mt-6 space-y-2.5 border-l-2 border-teal-200/70 pl-4">
            {tab.points.map((pt) => (
              <li key={pt} className="text-sm text-[var(--cp-navy)]">
                {pt}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-[var(--cp-muted)]">
            For real app screens, open the{" "}
            <a href="/demo" className="font-medium text-[var(--cp-teal)] underline underline-offset-2 hover:no-underline">
              interactive demo
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
